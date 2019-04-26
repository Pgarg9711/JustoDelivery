
import { Injectable } from '@angular/core';

/*
  Generated class for the ConstantsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConstantsProvider {

    constructor() {
        console.log('Hello ConstantsProvider Provider');
    }

}

export enum SITE_URLS {
    PRINT_LABEL = 'https://crm.justodelivery.com/staging/public/warehouse/print/arrival/order/label/',
    API_URL = 'https://crm.justodelivery.com/staging/public/api/',
    VERSION = 'v1',
    // API_URL = 'http://localhost:80/justodelivery/public/api/',
}

export enum VARS {
    API_KEY = "XYZ",
    INVALID_USER_STATUS = -1,
    EMAIL_PATTERN       = '^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
}
export enum IMG {
    DEFAULT_LOGO = "assets/imgs/logo.png",
    DEAULT_BG_IMG = "assets/imgs/default_img.svg",
    MOVE_ICON = "assets/imgs/move_item_icon.svg",
    SCAN_QR_ICON = "assets/imgs/scan_qr_icon.svg",
    TICKET_ICON = "assets/imgs/ticket_icon.svg",
    RECEIVER_ICON = "assets/imgs/new_receiver_icon.svg",
    SCAN_QR_BTN = "assets/imgs/qr-code(2).svg"
}

export enum RECEIVE_IN_RECORD_STATUS {
    INSPECTION_PENDING = "Pending Inspection",
    INSPECTION_IN_PROGRESS = "Inspection In Progress",
    INSPECTION_COMPLETED    = "Inspection Completed"
}

export enum VALIDATION_ERR_MSG {
    REQUIRED_FIELD_ERR = "*You must enter a value.",
    EMAIL_PATTERN_ERR = "Email Format is not correct",
    PASS_MIN_LENGTH = "Password must be 6 characters long!",
    NUMERIC_ONLY = "Only Numeric Values Allowed",
    GREATER_THAN_ZERO= "Value should be greater than or Equal to 1",
}
