import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,  LoadingController, Slides, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase';

import { File, FileEntry, Entry } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';

import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-horegister',
  templateUrl: 'horegister.html',
})
export class HoregisterPage {
  files: any;
  userForm: FormGroup;
  garageForm: FormGroup;
  public imgName;
  public fileName;
  public caption = "Choose a Photo";
  public captionFile = "Choose a File";
  private imgUrl;
  private fileUrl;
  private imgPath;
  private fileDir;
  private userId;

	constructor(public loadingCtrl: LoadingController, 
		private fb:FormBuilder,
		private authProvider: AuthProvider, 
		public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
		private fileChooser: FileChooser,
		private file: File,
    private filePath: FilePath,
    private toastCtrl: ToastController) {
		  this.userForm = this.fb.group({
	 		  'fname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
	 		  'lname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
	 		  'email':[null,Validators.compose([Validators.required, Validators.email])],
	 		  'password':[null,Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(30)])],
			  'mobile':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])]
      });

      this.garageForm = this.fb.group({
        'address':[null,Validators.compose([Validators.required, Validators.minLength(10)])],
        // 'capacity':[null,Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(4)])],
        'details':['']
     });

     this.files = [];
  }

  ionViewDidLoad() {
	}
	
	@ViewChild('slider') slider: Slides;
  @ViewChild('innerSlider') innerSlider: Slides;

	next() {
		this.slider.slideNext();
  }
  
  back() {
    this.slider.slidePrev();
  }

  presentActionSheet(file) {
    const actionSheet = this.actionSheetCtrl.create({
      title: file.name,
      buttons: [
        {
          text: 'Remove',
          role: 'destrutive',
          handler: () => {
            var index = this.files.indexOf(file);
            this.files.splice(index, 1);
            // console.log('Remove clicked');
          }
        },
        // {
        //   text: 'Change',
        //   handler: () => {
        //     var arrLength = this.files.length;
        //     this.chooseFile();
        //     alert(this.files.length);

        //     if (arrLength != this.files.length) {
        //       var index = this.files.indexOf(file);
        //       this.files.splice(index, 1);
        //     }
          
        //     actionSheet.dismiss();
        //     // console.log('Change clicked');
        //   }
        // },  
        {
          text: 'Cancel',
          role: 'cancel',
          // handler: () => {
          //   console.log('Cancel clicked');
          // }
        }
      ]
    });
    actionSheet.present();
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

  chooseFile() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
        this.file.resolveLocalFilesystemUrl(path).then((newUrl: Entry)=>{
          var fileEntry = newUrl as FileEntry;
          var fileType;
          fileEntry.file(success => {
            fileType = success.type;
          })

          this.fileUrl = newUrl;
  
          let dirPath = newUrl.nativeURL;
          this.fileName = dirPath;
          let dirPathSegments = dirPath.split('/'); //break string to array
          dirPathSegments.pop();  //remove last element
          dirPath = dirPathSegments.join('/');
          this.fileDir = dirPath;

          this.files.push({
            path: this.fileDir,
            name: this.fileUrl.name,
            type: fileType
          });

          alert(fileType);
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

  uploadFile(path, name, type) {
    this.file.readAsArrayBuffer(path, name).then((buffer)=>{
      let blob = new Blob([buffer], { type: type });

      let storageHere = firebase.storage();

      storageHere.ref('files/' + this.userId + "/" + name).put(blob);
    }).catch((error)=>{
      alert("error(1): " + JSON.stringify(error, Object.getOwnPropertyNames(error)));
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

  showToast() {
    let toast = this.toastCtrl.create({
      message: 'Account was created successfully. Account is pending for approval from admin.',
      duration: 8000
    })
    toast.present();
  }

  register(){
	const loading = this.loadingCtrl.create({
		content:'Creating account...'
	});

  loading.present(loading);

  	this.authProvider.locateHO().subscribe(location => {
		  this.authProvider.registerHomeOwner(this.userForm.value,this.garageForm.value,this.imgUrl.name,location).then((d)=>{
        this.userId = this.authProvider.setID();

        this.file.readAsArrayBuffer(this.imgPath, this.imgUrl.name).then(async (buffer)=>{
          await this.upload(buffer, this.imgUrl.name).then((d)=>{
        
            for(var i = 0; i < this.files.length; i++) {
              this.uploadFile(this.files[i].path, this.files[i].name, this.files[i].type);
            }
          }).catch((error)=>{
            alert("error(2): " + JSON.stringify(error, Object.getOwnPropertyNames(error)));
          })
        }).catch((err)=> {
          alert("error(3): " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
        })
  	
        loading.dismiss();
        this.showToast();
        this.navCtrl.setRoot("LoginPage");
      }).catch((error) => {
        loading.dismiss();
        this.showAlert();
        this.slider.slideTo(0);
      })
    })
  }
}