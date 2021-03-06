import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { File, FileEntry, Entry } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';

import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-co-edit-profile',
  templateUrl: 'co-edit-profile.html',
})
export class CoEditProfilePage {
  profileData:any;
  userForm:FormGroup;
  imgName;
  imgUrl;
  user;
  private imgPath;
  private userId = this.authProvider.userId;
  private imgType;
  profile$: AngularFireObject<any>;

  constructor(private afdb: AngularFireDatabase, 
    public navCtrl: NavController, 
    public nav: Nav,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,
    private fb:FormBuilder,
    private fileChooser: FileChooser,
	  private file: File,
    private filePath: FilePath,
    private toastCtrl: ToastController) {
      this.userForm = this.fb.group({
        'fname':[null,Validators.compose([Validators.required, Validators.pattern('[^0-9]*')])],
        'lname':[null,Validators.compose([Validators.required, Validators.pattern('[^0-9]*')])],
        'email':[null,Validators.compose([Validators.required, Validators.email])],
        'password':[null,Validators.compose([Validators.minLength(6)])],
        'mobile':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^09[0-9]*')])]
      });
    
  }

  ionViewDidLoad() {
    this.afdb.object(`/profile/` + this.userId).valueChanges().take(1).subscribe( data => {
      this.profileData = data;
      this.retrieveImg();
    });
  }

  retrieveImg() {
    firebase.storage().ref().child("images/" + this.userId + "/" + this.profileData.profPic).getDownloadURL().then(d=>{
      this.imgUrl = d;
    }).catch(e => {
      this.imgUrl = "./assets/imgs/avatar.jpg";
    })   
  }

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    })
    toast.present();
  }

  showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

  changeImg() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
        this.file.resolveLocalFilesystemUrl(path).then((newUrl: Entry)=>{
          var fileEntry = newUrl as FileEntry;

          fileEntry.file(fileObj => {
            if (fileObj.type === "image/jpeg" || fileObj.type === "image/png") {
              if (fileObj.size <= 5000000) {
                this.imgType = fileObj.type;

                let dirPath = newUrl.nativeURL;
                this.imgUrl = dirPath;
                let dirPathSegments = dirPath.split('/'); //break string to array
                this.imgName = dirPathSegments.pop();  //remove last element
                dirPath = dirPathSegments.join('/');
                this.imgPath = dirPath;  
              } else {
                this.showAlert('File Size Exceeded', 'Your file has exceeded 5MB.');
              }
            } else {
              this.showAlert('Invalid Image', 'Image must be a png or jpeg file.');
            }
          })       
        }).catch((error)=>{
          this.showAlert('Error', 'There was an error in resolving the picture URL.');
        });
      });
    });
  }

  async upload(buffer, name, type) {
    let blob = new Blob([buffer], { type: type });

    let storageHere = firebase.storage();

    storageHere.ref('images/' + this.userId + "/" + name).put(blob).catch((error)=>{
      this.showAlert("There was an error in uploading the image.", "");
    })
  }

  async editProfile() {
    var cont = true;
    const loading = this.loadingCtrl.create({
      content:'Updating profile...'
    });
  
    loading.present(loading);

    this.user = firebase.auth().currentUser;
    if (this.userForm.value['email'] != this.profileData.email) {
      await this.user.updateEmail(this.userForm.value['email'])
        .catch((error: "auth/email-already-in-use")=> {
          loading.dismiss();
          this.showToast('Cannot update email. Email already taken or used.');
          cont = false;
      });
    }

    if (cont) {
      if (this.userForm.value['password'] != null) {
        this.user.updatePassword(this.userForm.value['password']);
      }
      
      // Update profile values
      this.afdb.object(`/profile/` + this.userId).update(this.userForm.value).then(d => {
        // Update profile picture
        if (this.imgName != undefined) {
          this.file.readAsArrayBuffer(this.imgPath, this.imgName).then(async (buffer)=>{
            await this.upload(buffer, this.imgName, this.imgType);

            this.afdb.object(`/profile/` + this.userId).update({profPic: this.imgName}).then(() => {  
              loading.dismiss();
              this.showToast('Profile updated successfully.');
              this.navCtrl.setRoot('CoHomePage');    
            });
          });    
        } else {
          loading.dismiss();
          this.showToast('Profile updated successfully.');
          this.navCtrl.setRoot('CoHomePage');    
        }       
      })
    }
  }
}