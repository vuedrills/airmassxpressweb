package models

type CategoriesResponse struct {
	Data []Category `json:"data"`
}

type Category struct {
	ID            int           `json:"id"`
	Name          string        `json:"name"`
	Thumbnail     string        `json:"thumbnail"`
	SubCategories []SubCategory `json:"sub_categories"`
}

type SubCategory struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Thumbnail string `json:"thumbnail"`
}
