import { Component } from '@angular/core';
import {Events, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

/**
 * Generated class for the QrScannerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-qr-scanner',
  templateUrl: 'qr-scanner.html',
})
export class QrScannerPage {
  private callback: any;

  constructor(public navCtrl: NavController, public event: Events,public navParams: NavParams, public platform: Platform, public qrScanner: QRScanner) {
    platform.ready().then(()=>{
      this.qrScanner.show();
      window.document.querySelector('ion-app').classList.add('scanner-transparent-body');
      this.scanQRCode();
    });

    this.callback = this.navParams.get("callback")
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QrScannerPage');
  }
  scanQRCode(){

    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          // camera permission was granted
          console.log('Permission Granted');

          // start scanning
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            console.log('Scanned something', text);
            this.event.publish('JTD_SCANNED_TEXT',text);
            scanSub.unsubscribe(); // stop scanning
            // this.qrScanner.hide().catch(err=>console.error(err)); //hide camera preview
            window.document.querySelector('ion-app').classList.remove('scanner-transparent-body');
            // this.navCtrl.pop();
              this.navCtrl.pop();
          });

          this.qrScanner.resumePreview();

          this.qrScanner.show()
            .then((data : QRScannerStatus)=> {
              alert(data.showing);
            },err => {
              alert(err);

            });

        } else if (status.denied) {
          console.log('permission Denied');
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
        } else {
          console.log('else');
          // permission was denied, but not permanently. You can ask for permission again at a later time.
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }

  // showCamera() {
  //   console.log('shoWCamera');
  //   (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
  // }
  //
  // hideCamera() {
  //   (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
  // }
}
