import {TextFieldBase} from "@material/mwc-textfield/mwc-textfield-base";

import {styles as textfieldStyles} from '@material/mwc-textfield/mwc-textfield.css';

export const textfieldDefinition = {
    'mwc-textfield': class extends TextFieldBase {
        static get styles() {
            return textfieldStyles;
        }
    },
    // 'mwc-notched-outline': class extends NotchedOutlineBase {
    //     static get styles() {
    //         return notchedOutlineStyles;
    //     }
    // },
};