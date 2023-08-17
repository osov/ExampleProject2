local ____exports = {}
local flow = require("ludobits.m.flow")
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____utils = require("game.utils")
local get_random_numbers = ____utils.get_random_numbers
function ____exports.Game()
    local get_cell_position, get_item_by_hash, on_clicked, make_cell, get_cell_by_xy, check_win, game_end, update_ui, wait_event, game_size, cell_size, items_offset, cnt_step, scale_ratio, cells, free_cell, gm
    function get_cell_position(x, y, z)
        if z == nil then
            z = 0
        end
        return vmath.vector3(items_offset.x + cell_size * x + cell_size * 0.5, items_offset.y - cell_size * y - cell_size * 0.5, z)
    end
    function get_item_by_hash(h)
        do
            local i = 0
            while i < #cells do
                local cell = cells[i + 1]
                if cell._hash == h then
                    return cell
                end
                i = i + 1
            end
        end
        return nil
    end
    function on_clicked(h)
        local item = get_item_by_hash(h)
        if not item then
            return log("not hash", h)
        end
        local is_moved = math.abs(item.x - free_cell.x) == 1 and math.abs(item.y - free_cell.y) == 0 or math.abs(item.x - free_cell.x) == 0 and math.abs(item.y - free_cell.y) == 1
        if not is_moved then
            return
        end
        cnt_step = cnt_step + 1
        update_ui()
        local to_pos = get_cell_position(free_cell.x, free_cell.y)
        local tmp = {x = free_cell.x, y = free_cell.y}
        free_cell.x = item.x
        free_cell.y = item.y
        item.x = tmp.x
        item.y = tmp.y
        gm.move_to_with_time_hash(item._hash, to_pos, 0.3)
        check_win()
    end
    function make_cell(x, y, val)
        local cp = get_cell_position(x, y)
        local _go = gm.make_go("cell", cp)
        label.set_text(
            msg.url(nil, _go, "label"),
            tostring(val) .. ""
        )
        local item = {x = x, y = y, val = val, _hash = _go}
        cells[#cells + 1] = item
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        gm.add_game_item({_hash = _go, is_clickable = true})
    end
    function get_cell_by_xy(x, y)
        do
            local i = 0
            while i < #cells do
                local cell = cells[i + 1]
                if cell.x == x and cell.y == y then
                    return cell
                end
                i = i + 1
            end
        end
        return nil
    end
    function check_win()
        local index = 0
        do
            local y = 0
            while y < game_size do
                do
                    local x = 0
                    while x < game_size do
                        if index == game_size * game_size - 1 then
                            break
                        end
                        index = index + 1
                        local cell = get_cell_by_xy(x, y)
                        if not cell then
                            return false
                        end
                        if cell.val ~= index then
                            return false
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        game_end()
        return true
    end
    function game_end()
        flow.delay(1)
        Manager.send_raw_ui("game_end", {is_win = true})
    end
    function update_ui()
        Manager.send_raw_ui("steps", {cnt_step = cnt_step})
    end
    function wait_event()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
            if message_id == ID_MESSAGES.MSG_ON_UP_ITEM then
                local message = _message
                on_clicked(message.item._hash)
            end
        end
    end
    game_size = 2
    local orig_cell_size = 32
    cell_size = 32
    local offset_border = 10
    items_offset = vmath.vector3(offset_border, -150, 0)
    cnt_step = 0
    scale_ratio = 1
    cells = {}
    free_cell = {x = 0, y = 0}
    gm = GoManager()
    local function init()
        local level = GameStorage.get("level")
        if level == 1 then
            game_size = 3
        elseif level == 2 then
            game_size = 4
        elseif level == 3 then
            game_size = 7
        end
        cell_size = (540 - offset_border * 2) / game_size
        if cell_size > 100 then
            cell_size = 100
        end
        scale_ratio = cell_size / orig_cell_size
        items_offset.x = 540 / 2 - game_size / 2 * cell_size
        local index = 0
        local numbers = get_random_numbers(game_size * game_size - 1)
        do
            local y = 0
            while y < game_size do
                do
                    local x = 0
                    while x < game_size do
                        if index == game_size * game_size - 1 then
                            free_cell.x = x
                            free_cell.y = y
                            break
                        end
                        make_cell(x, y, numbers[index + 1])
                        index = index + 1
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        update_ui()
        wait_event()
    end
    init()
    return {}
end
return ____exports
