/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */

import * as flow from 'ludobits.m.flow';
import { GoManager } from '../modules/GoManager';
import { Messages } from '../modules/modules_const';
import { get_random_numbers } from './utils';

interface CellData {
    x: number;
    y: number;
    _hash: hash;
    val: number;
}

export function Game() {
    let game_size = 2;
    const orig_cell_size = 32;
    let cell_size = 32;
    const offset_border = 10;
    const items_offset = vmath.vector3(offset_border, -90, 0);
    let cnt_step = 0;
    let scale_ratio = 1;
    const cells: CellData[] = [];
    const free_cell = { x: 0, y: 0 };
    const gm = GoManager();


    function init() {
        const level = GameStorage.get('level');

        if (level == 1)
            game_size = 3;
        else if (level == 2)
            game_size = 4;
        else if (level == 3)
            game_size = 7;

        cell_size = (540 - offset_border * 2) / game_size;
        if (cell_size > 100)
            cell_size = 100;
        scale_ratio = cell_size / orig_cell_size;
        items_offset.x = 540 / 2 - (game_size / 2 * cell_size);

        let index = 0;
        const numbers = get_random_numbers(game_size * game_size - 1);
        for (let y = 0; y < game_size; y++) {
            for (let x = 0; x < game_size; x++) {
                if (index == game_size * game_size - 1) {
                    free_cell.x = x;
                    free_cell.y = y;
                    break;
                }
                make_cell(x, y, numbers[index]);
                index++;
            }

        }
        update_ui();
        wait_event();
    }

    function get_cell_position(x: number, y: number, z = 0) {
        return vmath.vector3(items_offset.x + cell_size * x + cell_size * 0.5, items_offset.y - cell_size * y - cell_size * 0.5, z);
    }

    function get_item_by_hash(h: hash) {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell._hash == h)
                return cell;
        }
        return null;
    }

    function on_clicked(h: hash) {
        const item = get_item_by_hash(h);
        if (!item)
            return log('not hash', h);
        const is_moved = (math.abs(item.x - free_cell.x) == 1 && math.abs(item.y - free_cell.y) == 0) ||
            (math.abs(item.x - free_cell.x) == 0 && math.abs(item.y - free_cell.y) == 1);
        if (!is_moved)
            return;
        cnt_step++;
        update_ui();
        const to_pos = get_cell_position(free_cell.x, free_cell.y);
        const tmp = { x: free_cell.x, y: free_cell.y };
        free_cell.x = item.x;
        free_cell.y = item.y;
        item.x = tmp.x;
        item.y = tmp.y;
        // ждем завершения корутины до тех пор пока анимация не выполнится, ни сообщения новые не будут приниматься
        // ни код дальше выполняться не будет
        //flow.until_callback((cb: any) => gm.move_to_with_time_hash(item._hash, to_pos, 0.2, cb));

        gm.move_to_with_time_hash(item._hash, to_pos, 0.3);
        check_win();
    }


    function make_cell(x: number, y: number, val: number) {
        const cp = get_cell_position(x, y);
        const _go = gm.make_go('cell', cp);
        label.set_text(msg.url(undefined, _go, 'label'), val + '');
        const item = { x, y, val, _hash: _go };
        cells.push(item);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        gm.add_game_item({ _hash: _go, is_clickable: true });
    }

    function get_cell_by_xy(x: number, y: number) {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell.x == x && cell.y == y)
                return cell;
        }
        return null;
    }

    function check_win() {
        let index = 0;
        for (let y = 0; y < game_size; y++) {
            for (let x = 0; x < game_size; x++) {
                if (index == game_size * game_size - 1)
                    break;
                index++;
                const cell = get_cell_by_xy(x, y);
                if (!cell)
                    return false;
                if (cell.val != index)
                    return false;

            }
        }
        game_end();
        return true;
    }

    function game_end() {
        flow.delay(1);
        Manager.send_raw_ui('game_end', { is_win: true });
    }

    function update_ui() {
        Manager.send_raw_ui('steps', { cnt_step });
    }

    function wait_event() {
        while (true) {
            const [message_id, _message, sender] = flow.until_any_message();
            gm.do_message(message_id, _message, sender);
            if (message_id == ID_MESSAGES.MSG_ON_UP_ITEM) {
                const message = _message as Messages['MSG_ON_UP_ITEM'];
                on_clicked(message.item._hash);
            }
        }
    }


    init();

    return {};
}

