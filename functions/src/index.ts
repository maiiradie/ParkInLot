import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { user } from 'firebase-functions/lib/providers/auth';

admin.initializeApp();

// exports.createProfile = functions.auth.user()
//     .onCreate((userRecord) => {
//         return admin.database().ref(`/profiles/${userRecord.uid}`).set({
//             email: userRecord.email
//         });
//     });
exports.requestsTimeout = functions.database.ref('requests/{hoID}/requestNode/{id}')
    .onCreate((event) => {
        setTimeout(() => {
            return event.ref.parent.child(`${event.key}`).remove();
        }, 3000);
        // 60000
});


exports.onDeleteRequest = functions.database.ref('requests/{hoID}/requestNode/{id}')
    .onDelete( (event) => {
        return admin.database().ref(`requests/${event.ref.parent.parent.key}`).once('value')
            .then(snapShot => {
                return admin.database().ref(`requests/${event.ref.parent.parent.key}`).update({
                    available: snapShot.val().available+1
                });
            });
    });


exports.deleteProfile = functions.auth.user()
    .onDelete((userRecord) => {
        return admin.database().ref(`/profile/${userRecord.uid}`).remove();
    });


