# Dependency Map

| Entity | Needs | Auto-seed first |
|--------|-------|-----------------|
| roles | - | - |
| users | roles | roles |
| categories | - | - |
| products | categories | categories |
| product_variants | products | products → categories |
| product_images | products | products → categories |
| addresses | users | users → roles |
| carts | users | users → roles |
| cart_items | carts, product_variants | all above |
| orders | users | users → roles |
| order_items | orders, product_variants | all above |
| reviews | users, products, orders | all above |
