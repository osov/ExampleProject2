/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as druid from 'druid.druid';
import * as default_style from "druid.styles.default.style";
import { register_manager } from '../modules/Manager';


interface props {
}

export function init(this: props) {
    msg.post('.', 'acquire_input_focus');
    register_manager();
    Manager.init(() => {

        Sound.attach_druid_click('sel');

        default_style.scroll.WHEEL_SCROLL_SPEED = 10;
        druid.set_default_style(default_style);

        Camera.set_go_prjection(-1, 1);

        Scene.load('menu', true);
        Scene.set_bg('#999');
    }, true);
}

export function update(this: props, dt: number): void {
    Manager.update(dt);
}


export function on_message(this: props, message_id: hash, _message: any, sender: hash): void {
    Manager.on_message(this, message_id, _message, sender);
    if (message_id == to_hash('LOAD_SCENE')) {
        const message = _message as SystemMessages['LOAD_SCENE'];
        const name = message.name;
    }


}
