# PoE2 Build Optimizer - System Architecture

> **Community Project**: This is an independent, fan-made project. Not affiliated with or endorsed by Grinding Gear Games.

## Overview

This document describes the architecture of the Path of Exile 2 Build Optimizer MCP Server (v1.0.0).

## Design Philosophy

**MCP = Data Access Layer, Claude = Intelligence Layer**

The server provides 32 focused tools that give AI assistants access to data they cannot obtain natively. The AI handles all analysis, optimization, and calculation using formulas provided by the `get_formula` tool.

## System Components

### 1. MCP Server (`src/mcp_server.py`)

**Purpose**: Main server implementing the Model Context Protocol

**Key Features**:
- 32 MCP tools for build analysis, validation, and data access
- Character data fetching from multiple sources
- Build comparison and recommendations
- Path of Building import/export

**Tool Categories (32 total)**:

| Category | Tools | Purpose |
|----------|-------|---------|
| Character Analysis | 4 | Fetch and analyze character data |
| Validation | 2 | Validate gem combos and build constraints |
| Gem Inspection | 4 | Query spell and support gem data |
| Passive Tree | 4 | Query passive nodes, keystones, notables |
| Base Items | 2 | Query base item types |
| Item Mods | 6 | Query and validate item modifiers |
| Path of Building | 3 | Import/export PoB codes |
| Trade | 3 | Search items and trade site |
| Knowledge | 2 | Game mechanics and formulas |
| Utility | 2 | Health check and cache management |

### 2. API Integration Layer (`src/api/`)

**character_fetcher.py** - Multi-Source Character Fetching
- 4-tier fallback: poe.ninja API -> SSE API -> Official API -> HTML scrape
- Each tier has independent error handling
- Cache bypasses all tiers on hit

**poe_ninja_api.py** - poe.ninja Integration
- Ladder data retrieval
- Build statistics
- Economy data (prices)

**trade_api.py** - Official Trade Site
- Search queries with Playwright browser automation
- Session cookie management
- Rate limiting

**rate_limiter.py** - Adaptive Rate Limiting
- Token bucket algorithm
- Exponential backoff on failures (max 32x)
- Per-endpoint rate limits:
  - PoE Official API: 10 req/min
  - poe.ninja: 20 req/min

**cache_manager.py** - Multi-Tier Caching
- L1: In-memory (1000 items, 5 min TTL)
- L2: Redis (optional, shared across instances)
- L3: SQLite (persistent)

### 3. Data Layer (`src/data/`)

**mod_data_provider.py** - Item Modifier Access
- 14,269 modifiers (prefixes, suffixes, implicits)
- Tier lookup and validation
- Stat text search

**fresh_data_provider.py** - Game Data Access
- Passive tree nodes (4,975+)
- Ascendancy nodes (335+)
- Skill and support gem data
- Base item data

### 4. Calculator Engine (`src/calculator/`)

**ehp_calculator.py** - Effective HP
- Per-damage-type EHP calculations
- Armor, evasion, block factoring
- Resistance mitigation

**spirit_calculator.py** - Spirit System
- Spirit cost calculations
- Reservation tracking
- Meta gem interactions

**stun_calculator.py** - Stun Mechanics
- Stun threshold calculations
- Recovery mechanics
- Mitigation factors

**resource_calculator.py** - Resources
- Mana/life/ES calculations
- Reservation handling
- Regeneration rates

### 5. Analyzer Layer (`src/analyzer/`)

**character_analyzer.py** - Build Analysis
- Overall character evaluation
- Defense layer analysis
- Skill setup review

**weakness_detector.py** - Vulnerability Detection
- Identifies build weaknesses
- Prioritized recommendations
- Fix suggestions

**archetype_classifier.py** - Build Classification
- Identifies build archetypes
- Meta comparison

### 6. Optimizer Layer (`src/optimizer/`)

**gear_optimizer.py** - Gear Recommendations
- Budget-aware suggestions
- Slot-by-slot analysis
- Priority ranking

**gem_synergy_calculator.py** - Support Gem Logic
- Compatibility checking
- Synergy calculations
- Invalid combination detection

### 7. Knowledge Layer (`src/knowledge/`)

**poe2_mechanics.py** - Game Mechanics Database
- Damage types and conversions
- Defense layers (armor, evasion, block, ES)
- Ailments (ignite, shock, freeze, chill, poison, bleed)
- Resource systems (mana, ES, life, spirit)
- Scaling formulas

### 8. Database Layer (`src/database/`)

**models.py** - SQLAlchemy ORM Models
- `Item` - Base item types
- `UniqueItem` - Unique items
- `Modifier` - Item/passive modifiers
- `PassiveNode` - Passive tree nodes
- `SkillGem` - Active skill gems
- `SupportGem` - Support gems

**manager.py** - Database Manager
- Async operations with aiosqlite
- Item/node search
- Build persistence

### 9. Parsers (`src/parsers/`)

**passive_tree_resolver.py** - Passive Tree
- Node lookup by ID/name
- Stat text resolution
- Tree navigation

**specifications/** - Datc64 Format Specs
- Binary file format definitions
- Field mappings for game data extraction

## Data Flow

```
User Query (via AI Assistant)
    |
    v
MCP Server receives tool call
    |
    v
Rate Limiter checks quota
    |
    v
Cache Manager checks for cached data
    |
    v (if cache miss)
API Client / Data Provider fetches data
    |
    v
Calculator/Analyzer processes data
    |
    v
Response formatted and returned
    |
    v
Cache Manager stores result
    |
    v
User receives formatted analysis
```

## Token Optimization

All list/enumeration tools support:
- **Pagination**: `limit` (default 20), `offset` parameters
- **Detail Levels**: `summary`, `standard`, `full`
- **Compact Format**: `compact=true` for abbreviated JSON keys

## Performance Targets

| Operation | Target |
|-----------|--------|
| Character Analysis | < 500ms |
| Gem/Mod Lookup | < 100ms |
| Passive Node Query | < 50ms |
| Full Build Analysis | < 3s |

## Security

- No credential storage in code
- Session cookies stored locally only
- Rate limiting prevents API abuse
- SQL injection prevention via ORM
- Input validation on all tool arguments

## Technology Stack

| Component | Technology |
|-----------|------------|
| Language | Python 3.9+ |
| Protocol | Model Context Protocol (MCP) |
| Database | SQLite + SQLAlchemy (async) |
| HTTP | httpx, aiohttp |
| Caching | Memory + Redis (optional) + SQLite |
| Browser Automation | Playwright (trade only) |

## Installation Methods

| Method | Command | Use Case |
|--------|---------|----------|
| PyPI | `pip install poe2-mcp` | Recommended |
| Source | `pip install -e .` | Development |
| Bundle | `.mcpb` from GitHub Releases | One-click install |

## Adding New Features

### Adding a New MCP Tool

1. Define tool in `_register_tools()` method
2. Add handler dispatch in `handle_call_tool()`
3. Implement `_handle_<toolname>()` handler
4. Initialize any required components in `__init__()`
5. Add tests in `tests/`

### Adding New Data Providers

1. Create class in `src/data/`
2. Implement async data loading methods
3. Initialize in MCP server `__init__()`
4. Use from tool handlers

## References

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [PyPI Package](https://pypi.org/project/poe2-mcp/)
- [GitHub Repository](https://github.com/HivemindOverlord/poe2-mcp)
