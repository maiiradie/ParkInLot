import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,  LoadingController, Slides, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase';

import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';

// import { HomehoPage } from '../homeho/homeho';
// import { LoginPage } from '../login/login';

import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-horegister',
  templateUrl: 'horegister.html',
})
export class HoregisterPage {

  userForm:FormGroup;
  garageForm:FormGroup;
  public imgName;
  public caption = "Choose a Photo";
  private imgUrl;
  private imgPath;
  private userId;

	constructor(public loadingCtrl: LoadingController, 
		private fb:FormBuilder,
		private authProvider: AuthProvider, 
		public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController,
		private fileChooser: FileChooser,
		private file: File,
		private filePath: FilePath) {
		  this.userForm = this.fb.group({
	 		  'fname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
	 		  'lname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
	 		  'email':[null,Validators.compose([Validators.required, Validators.email])],
	 		  'password':[null,Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(30)])],
			  'mobile':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])],
			  'gender':[null,Validators.compose([Validators.required])],
      });

      this.garageForm = this.fb.group({
        'address':[null,Validators.compose([Validators.required, Validators.minLength(10)])],
        'capacity':[null,Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(4)])],
        'details':['']
     });
  }

  ionViewDidLoad() {
	}
	
	@ViewChild('slider') slider: Slides;
  @ViewChild('innerSlider') innerSlider: Slides;

	goToGarage() {
		this.slider.slideTo(1);
	}
	
	choose() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
      
      this.file.resolveLocalFilesystemUrl(path).then((newUrl)=>{
        this.imgUrl = newUrl;

        let dirPath = newUrl.nativeURL;
        this.imgName = dirPath;
        let dirPathSegments = dirPath.split('/'); //break string to array
        dirPathSegments.pop();  //remove last element
        dirPath = dirPathSegments.join('/');
        this.imgPath = dirPath;
        
        this.caption = "Change Photo";
          
        
      }).catch((e)=>{
        alert("error " + JSON.stringify(e));
      })
    })
  })
  }

  async upload(buffer, name) {
    let blob = new Blob([buffer], { type: 'image/jpeg' });

    let storageHere = firebase.storage();

    storageHere.ref('images/' + this.userId + "/" + name).put(blob).catch((error)=>{
      alert("error" + JSON.stringify(error));
    })
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Email in Use',
      subTitle: 'Your email is already taken or used.',
      buttons: ['OK']
    });
    alert.present();
  }

  register(){
	const loading = this.loadingCtrl.create({
		content:'Getting your location...'
	});

  loading.present(loading);

  	this.authProvider.locateHO().subscribe( location => {
		  this.authProvider.registerHomeOwner(this.userForm.value,this.garageForm.value,location).then((d)=>{
        this.userId = this.authProvider.setID();

        this.file.readAsArrayBuffer(this.imgPath, this.imgUrl.name).then(async (buffer)=>{
          await this.upload(buffer, this.imgUrl.name).then((d)=>{
            
            this.navCtrl.setRoot("LoginPage");
          });
        })
      }).catch((error:"auth/email-already-in-use") => {
        this.showAlert();
        this.slider.slideTo(0);
      });
    })
        // this.authProvider.setID();
				
				loading.dismiss();
 }

}
