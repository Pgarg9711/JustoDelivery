import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AuthProvider} from "../providers/auth/auth";
import { IMG } from "../providers/constants/constants";


@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any;
    u_name: any;
    pages: Array<{title: string, component: any}>;
    SIDEBAR_LOGO = IMG.DEFAULT_LOGO;

    constructor(public platform: Platform,
                public statusBar: StatusBar,
                public splashScreen: SplashScreen,
                public storage: Storage,
                public authProvider: AuthProvider) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Dashboard', component: 'DashboardPage' },
            { title: 'Profile', component: '' },
            { title: 'Logout', component: ''}
        ];

    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();

            this.storage.get('JST_USER_DETAILS').then((data:any) => {
                if(data){
                    console.log(data);
                    this.u_name = data.name;
                    this.rootPage = 'ReceiveInRecordImagesPage';
                     // this.rootPage = 'DashboardPage';
                }
                else{
                    this.rootPage = 'ReceiveInRecordImagesPage';
                     //this.rootPage = 'SignInPage';
                }
            });
        });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        if(page.title == 'Logout'){
            this.authProvider.logout('BtnClicked');
        }
        else{
            this.nav.setRoot(page.component);
        }

    }
}
