# PoE2 MCP Server - Setup Guide

> **Community Project**: This is an independent, fan-made project. Not affiliated with or endorsed by Grinding Gear Games.

## Quick Setup (5 Minutes)

### Step 1: Install the Package

**Option A: PyPI (Recommended)**
```bash
pip install poe2-mcp
```

**Option B: From Source**
```bash
git clone https://github.com/HivemindOverlord/poe2-mcp.git
cd poe2-mcp
pip install -e .
```

**Option C: .mcpb Bundle**
1. Download `poe2-mcp-1.0.0.mcpb` from [GitHub Releases](https://github.com/HivemindOverlord/poe2-mcp/releases/latest)
2. In Claude Desktop: Settings > Extensions > Install Extension
3. Select the downloaded file

### Step 2: Configure Your AI Assistant

#### Claude Desktop

Edit your config file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "poe2-optimizer": {
      "command": "poe2-mcp"
    }
  }
}
```

Or if running from source:
```json
{
  "mcpServers": {
    "poe2-optimizer": {
      "command": "python",
      "args": ["/path/to/poe2-mcp/launch.py"]
    }
  }
}
```

Restart Claude Desktop after saving.

### Step 3: Verify Installation

Ask your AI assistant:
> "Use the health_check tool to verify the PoE2 MCP server is working"

Expected response includes:
- Database connected
- 32 tools registered
- All handlers present

## What's Included

### 32 MCP Tools

| Category | Tools |
|----------|-------|
| Character Analysis | `analyze_character`, `compare_to_top_players`, `import_poe_ninja_url`, `analyze_passive_tree` |
| Validation | `validate_support_combination`, `validate_build_constraints` |
| Gem Data | `inspect_support_gem`, `inspect_spell_gem`, `list_all_supports`, `list_all_spells` |
| Passive Tree | `list_all_keystones`, `inspect_keystone`, `list_all_notables`, `inspect_passive_node` |
| Base Items | `list_all_base_items`, `inspect_base_item` |
| Item Mods | `inspect_mod`, `list_all_mods`, `search_mods_by_stat`, `get_mod_tiers`, `validate_item_mods`, `get_available_mods` |
| Path of Building | `import_pob`, `export_pob`, `get_pob_code` |
| Trade | `search_items`, `search_trade_items`, `setup_trade_auth` |
| Knowledge | `explain_mechanic`, `get_formula` |
| Utility | `health_check`, `clear_cache` |

### Game Data

- 4,975+ passive tree nodes
- 335+ ascendancy nodes (99% coverage)
- 14,269 item modifiers
- Complete skill gem data
- Support gem interactions

## Optional Setup

### Trade API Authentication

For `search_trade_items` to work, authenticate with pathofexile.com:

```bash
pip install playwright
playwright install chromium
python -m poe2_mcp.scripts.setup_trade_auth
```

Or manually:
1. Log into pathofexile.com in Chrome/Edge
2. Press F12 > Application > Cookies > pathofexile.com
3. Copy `POESESSID` value
4. Add to `.env`: `POESESSID=your_cookie_value`

### Environment Variables

Create `.env` in your working directory (optional):

```bash
# For AI-enhanced features (optional)
ANTHROPIC_API_KEY=sk-ant-...

# For trade search (optional)
POESESSID=your_session_cookie

# Debug mode
DEBUG=false
LOG_LEVEL=INFO
```

## Testing the Setup

### Test 1: Health Check

Ask your AI:
> "Run health_check with verbose=true"

### Test 2: Character Analysis

Ask your AI:
> "Analyze the character 'YourCharacterName' from account 'YourAccountName'"

**Note**: Your character must be:
- On public profile (pathofexile.com > Account > Privacy Settings)
- Indexed on poe.ninja (usually requires being on the ladder)

### Test 3: Keystone Lookup

Ask your AI:
> "Tell me about the Chaos Inoculation keystone"

### Test 4: Support Gem Validation

Ask your AI:
> "Can I use Faster Projectiles and Slower Projectiles together?"

## Troubleshooting

### "Server not found" in Claude Desktop

1. Verify Python is in your PATH: `python --version`
2. Check config path is absolute, not relative
3. Try running directly: `poe2-mcp` or `python launch.py`
4. Check Claude Desktop logs for errors

### "No character found"

1. Your profile must be public on pathofexile.com
2. Character names are case-sensitive
3. Try using a poe.ninja URL directly with `import_poe_ninja_url`
4. Wait 10+ minutes after making profile public

### Tools return empty results

1. Run `health_check` to verify database status
2. Ensure `data/` directory contains JSON files
3. Try `clear_cache` and retry

### Windows-Specific Issues

If `poe2-mcp` command not found after pip install:
```bash
# Add Python Scripts to PATH, or run directly:
python -m poe2_mcp
```

### Rate Limiting

If you see rate limit errors:
- The server has built-in rate limiting
- Wait a few minutes and retry
- Reduce request frequency

## Updating

### PyPI Install

```bash
pip install --upgrade poe2-mcp
```

### From Source

```bash
cd poe2-mcp
git pull origin main
pip install -e .
```

## Getting Help

- [GitHub Issues](https://github.com/HivemindOverlord/poe2-mcp/issues)
- [README](../../README.md)
- [Architecture Docs](../ARCHITECTURE.md)

## Requirements

- Python 3.9 or higher
- 50MB disk space (100MB+ with .mcpb bundle)
- Internet connection for character data

---

**Version**: 1.0.0
**Last Updated**: December 2025
