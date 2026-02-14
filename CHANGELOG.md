# Changelog

All notable changes to this project will be documented in this file.
Format based on Path of Building changelog style, adapted for MCP tooling.

> **Community Project**: This is an independent, fan-made project built out of love for Path of Exile 2. Not affiliated with or endorsed by Grinding Gear Games.

---

## Fork: Cursor & IDE compatibility (tyniaiworkspace-dev)

Fork of HivemindOverlord/poe2-mcp with fixes for Cursor and other IDEs. No capability removed; all 32 tools preserved.

* **Entry points:** Sync `main()` for `poe2-mcp` console script; `launch.py` now calls `_main_async()` so both pip install and `python launch.py` work.
* **Pagination:** `get_pagination_args()` and `PaginationMeta` int coercion so limit/offset from MCP clients (string or int) work; "use offset=..." uses correct ints.
* **Logging:** Default log level WARNING; DEBUG only when `POE2_MCP_DEBUG` or `LOG_LEVEL=DEBUG` to avoid IDE stderr spam.
* **Scraper:** poe2db URL set to `/us/Unique_item`; link-based fallback when page has no tables so uniques scrape reliably.
* **Support gems:** When FreshDataProvider has no support gems (e.g. no .datc64), load from `data/poe2_support_gems_database.json` so `list_all_supports` works on first install.

---

## Version 1.0.0 (2025-12-16) - First Major Release

The first stable release of the PoE2 Build Optimizer MCP server. Provides 32 MCP tools for AI-powered character analysis and build optimization.

--- Core Features ---
* 32 registered MCP tools for character analysis, validation, and optimization
* Multi-source character fetching (poe.ninja, official API, HTML scrape fallback)
* Path of Building import/export support
* Comprehensive game mechanics knowledge base

--- MCP Tools ---
* Character analysis: `analyze_character`, `compare_to_top_players`, `import_poe_ninja_url`
* Validation tools: `validate_support_combination`, `validate_build_constraints`
* Gem inspection: `inspect_support_gem`, `inspect_spell_gem`, `list_all_supports`, `list_all_spells`
* Passive tree: `list_all_keystones`, `inspect_keystone`, `list_all_notables`, `inspect_passive_node`
* Base items: `list_all_base_items`, `inspect_base_item`
* Item mods: `inspect_mod`, `list_all_mods`, `search_mods_by_stat`, `get_mod_tiers`, `validate_item_mods`
* Path of Building: `import_pob`, `export_pob`, `get_pob_code`
* Knowledge: `explain_mechanic`, `get_formula`

--- Token Optimization ---
* Pagination support with `limit` (default 20) and `offset` parameters
* Detail level filtering (`summary`, `standard`, `full`) for response verbosity control
* Compact output format with abbreviated JSON keys for programmatic consumption

--- Data Sources ---
* 4,975+ passive tree nodes with full stat text
* 335+ ascendancy nodes (99% coverage)
* 14,269 item modifiers (prefixes, suffixes, implicits)
* Complete skill gem data from Path of Building
* Support gem effects and interaction data

--- Infrastructure ---
* SQLite database with async support (aiosqlite)
* Multi-tier caching (memory -> Redis optional -> SQLite)
* Rate limiting with exponential backoff
* Comprehensive test suite

---

## Prior Development History

See git commits before 2025-12-16 for development history leading to v1.0.0.
