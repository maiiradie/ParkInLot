import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation';
import { MyApp } from './app.component';
// import { LoginPage } from '../pages/login/login';
// import { CoregisterPage } from '../pages/coregister/coregister';
// import { HoregisterPage } from '../pages/horegister/horegister';
import { FCM } from '@ionic-native/fcm';

// import { EditProfilePage } from '../pages/edit-profile/edit-profile';
// import { GaragePage } from '../pages/garage/garage';
// import { TransacHistoryPage } from '../pages/transac-history/transac-history';

import { FIREBASE_CONFIG } from './app.firebase.config';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { FileTransfer } from '@ionic-native/file-transfer';

import { AuthProvider } from '../providers/auth/auth'; 
import { RequestProvider } from '../providers/request/request'; 
@NgModule({
  declarations: [
    MyApp,
    // LoginPage,
    // CoregisterPage,
    // HoregisterPage

    // EditProfilePage,
    // GaragePage,
    // TransacHistoryPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssist: false}),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    ReactiveFormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    // LoginPage,
    // CoregisterPage,
    // HoregisterPage
    // EditProfilePage,
    // GaragePage,
    // TransacHistoryPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
  File,
    FileChooser,
    FilePath,
    FileTransfer,
    FCM,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
AuthProvider,
    Geolocation,
    AuthProvider,
    RequestProvider,
  ]
})
export class AppModule {}
