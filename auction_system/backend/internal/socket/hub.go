package socket

import "encoding/json"

type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	Register chan *Client

	// Unregister requests from clients.
	Unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.clients[client] = true
		case client := <-h.Unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// Helper to broadcast JSON events
type Event struct {
	Type    string      `json:"type"` // e.g., "BID_PLACED"
	Payload interface{} `json:"payload"`
}

func (h *Hub) BroadcastEvent(eventType string, payload interface{}) {
	msg := Event{
		Type:    eventType,
		Payload: payload,
	}
	bytes, _ := json.Marshal(msg)
	h.broadcast <- bytes
}

func (h *Hub) BroadcastToUser(userID uint, eventType string, payload interface{}) {
	if userID == 0 {
		return
	}
	msg := Event{
		Type:    eventType,
		Payload: payload,
	}
	bytes, _ := json.Marshal(msg)

	// Since broadcast is a global channel, we might want a separate channel or just iterate.
	// For simplicity in this hub design, we'll just iterate over clients right now.
	// In a more robust design, we'd have a map[userID][]chan
	for client := range h.clients {
		if client.UserID == userID {
			select {
			case client.Send <- bytes:
			default:
				// close(client.Send)
			}
		}
	}
}
