import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler, Events } from 'ionic-angular';
import { MyApp } from './app.component';

import { SettingPage } from '../pages/setting/setting';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AccountServiceProvider } from '../providers/account-service/account-service';
import { HTTP } from '@ionic-native/http';
import { SecureStorage } from '@ionic-native/secure-storage';
import { ApiServiceProvider } from '../providers/api-service/api-service';
import { SimpleToastServiceProvider } from '../providers/simple-toast-service/simple-toast-service';

@NgModule({
  declarations: [
    MyApp,
    SettingPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SettingPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  providers: [
    Events,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AccountServiceProvider,
    HTTP,
    SecureStorage,
    ApiServiceProvider,
    SimpleToastServiceProvider
  ]
})
export class AppModule {}
