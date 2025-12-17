package services

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for now (adjust for production)
	},
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub
	// The websocket connection.
	conn *websocket.Conn
	// Buffered channel of outbound messages.
	send chan []byte
	// User ID
	userID uuid.UUID
}

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// User ID to Clients map for targeted broadcast
	userClients map[uuid.UUID][]*Client

	// Rooms map: RoomID -> Set of Clients
	rooms map[string]map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Broadcast to specific room
	broadcastRoom chan RoomMessage

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	// Subscription requests
	subscribe   chan Subscription
	unsubscribe chan Subscription

	mu sync.RWMutex
}

type RoomMessage struct {
	RoomID  string
	Message []byte
}

type Subscription struct {
	Client *Client
	RoomID string
}

func NewHub() *Hub {
	return &Hub{
		broadcast:     make(chan []byte),
		broadcastRoom: make(chan RoomMessage),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		subscribe:     make(chan Subscription),
		unsubscribe:   make(chan Subscription),
		clients:       make(map[*Client]bool),
		userClients:   make(map[uuid.UUID][]*Client),
		rooms:         make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.userClients[client.userID] = append(h.userClients[client.userID], client)
			h.mu.Unlock()
		case client := <-h.unregister:
			// Unregister from everything
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)

				// Remove from userClients
				clients := h.userClients[client.userID]
				for i, c := range clients {
					if c == client {
						h.userClients[client.userID] = append(clients[:i], clients[i+1:]...)
						break
					}
				}
				if len(h.userClients[client.userID]) == 0 {
					delete(h.userClients, client.userID)
				}

				// Remove from all rooms
				for roomID, clients := range h.rooms {
					if _, inRoom := clients[client]; inRoom {
						delete(clients, client)
						if len(clients) == 0 {
							delete(h.rooms, roomID)
						}
					}
				}
			}
			h.mu.Unlock()

		case sub := <-h.subscribe:
			h.mu.Lock()
			if h.rooms[sub.RoomID] == nil {
				h.rooms[sub.RoomID] = make(map[*Client]bool)
			}
			h.rooms[sub.RoomID][sub.Client] = true
			h.mu.Unlock()

		case sub := <-h.unsubscribe:
			h.mu.Lock()
			if clients, ok := h.rooms[sub.RoomID]; ok {
				delete(clients, sub.Client)
				if len(clients) == 0 {
					delete(h.rooms, sub.RoomID)
				}
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			// GLOBAL Broadcast (use sparingly)
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()

		case roomMsg := <-h.broadcastRoom:
			// Targeted Room Broadcast
			h.mu.RLock()
			if clients, ok := h.rooms[roomMsg.RoomID]; ok {
				for client := range clients {
					select {
					case client.send <- roomMsg.Message:
					default:
						// If channel is full, we assume slow reader or disconnection
						// Should we close? Maybe not just for a room message fail.
						// But for robustness, we skip.
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastToRoom sends a message to a specific room/topic
func (h *Hub) BroadcastToRoom(roomID string, message interface{}) {
	jsonMsg, err := json.Marshal(message)
	if err != nil {
		log.Println("Error marshalling room message:", err)
		return
	}
	h.broadcastRoom <- RoomMessage{
		RoomID:  roomID,
		Message: jsonMsg,
	}
}

// SubscribeClient safely subscribes a client to a room
func (h *Hub) SubscribeClient(client *Client, roomID string) {
	h.subscribe <- Subscription{Client: client, RoomID: roomID}
}

// UnsubscribeClient safely unsubscribes a client from a room
func (h *Hub) UnsubscribeClient(client *Client, roomID string) {
	h.unsubscribe <- Subscription{Client: client, RoomID: roomID}
}

// SendToUser sends a message to a specific user
func (h *Hub) SendToUser(userID uuid.UUID, message interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	clients, ok := h.userClients[userID]
	if !ok {
		return
	}

	jsonMsg, err := json.Marshal(message)
	if err != nil {
		log.Println("Error marshalling websocket message:", err)
		return
	}

	for _, client := range clients {
		select {
		case client.send <- jsonMsg:
		default:
			// Client likely disconnected or blocked
		}
	}
}

// readPump pumps messages from the websocket connection to the hub.
func (c *Client) readPump() {
	defer func() {
		log.Printf("readPump: Closing connection for user %s", c.userID)
		c.hub.unregister <- c
		c.conn.Close()
	}()
	log.Printf("readPump: Starting for user %s", c.userID)
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("readPump error: %v", err)
			} else {
				log.Printf("readPump: Closed normally or expected error: %v", err)
			}
			break
		}

		// Handle JSON messages
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err == nil {
			msgType, _ := msg["type"].(string)

			if msgType == "ping" {
				pongMsg, _ := json.Marshal(map[string]string{"type": "pong"})
				c.send <- pongMsg
				continue
			}

			if msgType == "subscribe" {
				if topic, ok := msg["topic"].(string); ok && topic != "" {
					c.hub.SubscribeClient(c, topic)
					log.Printf("Client %s subscribed to %s", c.userID, topic)
				}
				continue
			}

			if msgType == "unsubscribe" {
				if topic, ok := msg["topic"].(string); ok && topic != "" {
					c.hub.UnsubscribeClient(c, topic)
					log.Printf("Client %s unsubscribed from %s", c.userID, topic)
				}
				continue
			}
		}

		// Currently ignoring other inbound messages as we use REST for sending,
		// but we must extend the deadline to keep connection alive if we receive anything.
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
	}
}

// writePump pumps messages from the hub to the websocket connection.
func (c *Client) writePump() {
	log.Printf("writePump: Starting for user %s", c.userID)
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ServeWs handles websocket requests from the peer.
func ServeWs(hub *Hub, c *gin.Context) {
	// Authentication is handled by middleware which checks both Header and Query param
	userIDVal, exists := c.Get("user_id")

	if !exists {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	userID := userIDVal.(uuid.UUID)

	log.Printf("ServeWs: Upgrading connection for user %s", userID)
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println("ServeWs: Upgrade complete, registering client")

	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), userID: userID}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
