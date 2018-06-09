"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.requestsTimeout = functions.database.ref('requests/{hoID}/requestNode/{id}')
    .onCreate((event) => {
    setTimeout(() => {
        // event.key = -LEZTyRbC9jRSRHJPzLl
        event.ref.parent.child(`${event.key}`).update({
            status: "timedOut"
        }).then(() => {
            return event.ref.parent.child(`${event.key}`).remove();
        }).catch(err => {
            return err;
        });
    }, 60000);
    // 60000
    return true;
});
exports.onDeleteRequest = functions.database.ref('requests/{hoID}/requestNode/{id}')
    .onDelete((event) => {
    return admin.database().ref(`requests/${event.ref.parent.parent.key}`).once('value')
        .then(snapShot => {
        return admin.database().ref(`requests/${event.ref.parent.parent.key}`).update({
            available: snapShot.val().available + 1
        });
    });
});
// exports.createProfile = functions.auth.user()
//     .onCreate((userRecord) => {
//         return admin.database().ref(`/profiles/${userRecord.uid}`).set({
//             email: userRecord.email
//         });
//     });
// exports.deleteProfile = functions.auth.user()
//     .onDelete((userRecord) => {
//         return admin.database().ref(`/profile/${userRecord.uid}`).remove();
//     });
//# sourceMappingURL=index.js.map