import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-ho-edit-garage',
  templateUrl: 'ho-edit-garage.html',
})

export class HoEditGaragePage {
  userData;
  location;
  garageForm: FormGroup;
  choices: any;
  imgName;
  // oldImg;
  imgUrl;
  details = [];
  requestData;
  transacting;
  private imgPath;
  private userId;
  profile$: AngularFireObject<any>;

  constructor(private afdb: AngularFireDatabase,
    public navCtrl: NavController,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    public loadingCtrl: LoadingController,
    private fb: FormBuilder,
    private fileChooser: FileChooser,
    private file: File,
    private filePath: FilePath,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController) {
    this.garageForm = this.fb.group({
      'address': [null, Validators.compose([Validators.required])],
      'details': [''],
      'capacity': [null, Validators.compose([Validators.required, Validators.pattern('^[1-9][0-9]*$')])]
    });
    this.userId = this.authProvider.userId;
    this.choices = [
      {description: 'With roof'},
      {description: 'With gate'},
      {description: 'Cemented'}
    ];
  }

  ionViewDidLoad() {
    this.afdb.object(`/profile/` + this.userId).valueChanges().take(1).subscribe(data => {
      this.userData = data;
      this.retrieveImg();
      this.details = this.userData.details;
      this.choices.forEach(choice => {
        var index = this.details.indexOf(choice.description);
        // console.log(index);
        if(index == -1) {
          choice.checked = false;
        } else {
          choice.checked = true;
        }
        console.log(index);
      })
      console.log(this.details);
      console.log(this.choices);

      this.afdb.object(`/location/` + this.userId).valueChanges().take(1).subscribe(out => {
        this.location = out;
      })

      this.afdb.object(`/requests/` + this.userId).valueChanges().take(1).subscribe(out2 => {
        this.requestData = out2;
      })

    });
    this.ifTransacting();
  }

  showToast() {
    let toast = this.toastCtrl.create({
      message: 'Garage updated successfully.',
      duration: 3000
    })
    toast.present();
  }

  retrieveImg() {
    try {
      firebase.storage().ref().child("images/" + this.userId + "/" + this.userData.garagePic).getDownloadURL().then(d => {
        this.imgUrl = d;
        // this.oldImg = d;
      });
    }
    catch (e) {
    }
  }

  onChange(choice) {
    var index = this.details.indexOf(choice.description);
    // console.log(this.choices[index]);
    if(!choice.checked) {
      this.details.push(choice.description);
      choice.checked = true;
    } else {
      this.details.splice(index, 1);
      choice.checked = false;
    }
    // choice.checked = true;
    console.log("outside " + this.details);
  }

  showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

  // Open file chooser and select new picture
  changeImg() {
    this.fileChooser.open().then((url) => {
      this.filePath.resolveNativePath(url).then((path) => {
        this.file.resolveLocalFilesystemUrl(path).then((newUrl) => {
          // this.imgUrl = newUrl;

          let dirPath = newUrl.nativeURL;
          this.imgUrl = dirPath;
          let dirPathSegments = dirPath.split('/'); //break string to array
          this.imgName = dirPathSegments.pop();  //remove last element
          dirPath = dirPathSegments.join('/');
          this.imgPath = dirPath;
        }).catch((e) => {
          this.showAlert("There was an error in retrieving the image.", "");
        });
      });
    });
  }

  // Upload new garage picture
  async upload(path, name) {
    await new Promise(resolve => {
      this.file.readAsArrayBuffer(path, name).then((buffer) => {
        let blob = new Blob([buffer], { type: 'image/jpeg' });
        let storageHere = firebase.storage();
  
        storageHere.ref('images/' + this.userId + "/" + name).put(blob).catch((error) => {
          this.showAlert("There was an error in uploading the image.", "");
        });
      });
    })
  }

  
  // Update garage details
  async updateGarage() {
    const loading = this.loadingCtrl.create({
      content: 'Updating garage...'
    });

    loading.present(loading);

    this.afdb.object(`/profile/` + this.userId).update({ details: this.details }).then(d => {
      this.afdb.object(`/location/` + this.userId).update({ address: this.garageForm.value['address'] }).then(d => {
        this.afdb.object(`/requests/` + this.userId).update({ capacity: this.garageForm.value['capacity'] }).then(d => {
          this.afdb.object(`/requests/` + this.userId).update({ available: this.garageForm.value['capacity'] }).then(async d => {
            if(this.imgName != undefined) {
              this.afdb.object(`/profile/` + this.userId).update({ garagePic: this.imgName });
              await this.upload(this.imgPath, this.imgName).then(() => {
                loading.dismiss();
                this.showToast();
                this.navCtrl.setRoot('HoGaragePage');
              })
            } else {
              loading.dismiss();
              this.showToast();
              this.navCtrl.pop();
            }
          });
        });
      });
    });
  }

  ifTransacting() {
    this.afdb.object<any>('requests/' + this.userId).valueChanges().subscribe(data => {
      if (data.arrivingNode || data.requestNode || data.parkedNode) {
        this.transacting = true;
      } else {
        this.transacting = false;
      }
    })
    
  }

  showTransactingToast() {
    let toast = this.toastCtrl.create({
      message: 'Garage capacity may not be edited while there are ongoing transactions.',
      duration: 3000
    })
    toast.present();
  }
}