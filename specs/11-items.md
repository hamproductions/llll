# Items

An items page backed by the Items DB table.

## Acceptance Criteria

- Items page exists at `/items`
- Items are loaded from the Items DB table
- Each item shows its name, rarity, and icon when available (`icon_item_store_item_*`)
- Items are browsable with category or type filtering
- Missing icon assets degrade gracefully (item icons may not be locally extracted yet)
