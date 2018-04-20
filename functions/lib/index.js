"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
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
//# sourceMappingURL=index.js.map