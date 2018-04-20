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

exports.deleteProfile = functions.auth.user()
    .onDelete((userRecord) => {
        return admin.database().ref(`/profile/${userRecord.uid}`).remove();
    });