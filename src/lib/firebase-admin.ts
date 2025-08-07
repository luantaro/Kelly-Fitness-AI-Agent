import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail:
      "firebase-adminsdk-fbsvc@kelly-fitness-93e58.iam.gserviceaccount.com",
    privateKey:
      process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ||
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDRdJCBYnyCVE7x\nsS+TZp8UmXZpcP1wWFWsrk5WS6FzSvcWBOqx1GEl7wBdQ0xzupEO21r1yls576it\nV6LvlpUHA5Y1EBmEi2SswmYBUGDMKt8bVGAE4Z/FjBWqs52TZLnfymbx8eqwpNHf\nJbWXTzqbZHWnRSioR+VI8JrMV3aTA5Y143rx+S7+R4saSdCeyNJzSm4G6FmgtzYp\nPmAs0KmwrHMNn3RGPooXEhthd28zaI+9B2VSoVwVlO2mjwoZROrn8+4XcMDcVr/f\noptMkPKiBNjLKImeDEiqZhTHtFEPdv7QNYuScIxNhkYMIS0m3CsKdmNCCgH3rr+N\n71Cc6SfxAgMBAAECggEAQItmknBqhPD9CM68pfQcNolZ64E1oD6gXB+0pTQWMwSZ\nYrAuMJGNRFbDqnm4H/uQgt8GxzJN7WsUdCJK5ADnuKsayQxGiMk5w2D+dQ4zXgci\nDHZyRl7O0N3ruVgzST3jZ3qkQY92bmvD/rtMm61/Fm6dMOgHcOAC4HjAgxK6x+9m\nkksi4RuuGQyzjyNTeaQQA5OAq5rjXRYjNnJ48AAWzOtPvMTUZOo8nCuyr0V2qeRI\n4fwhuqs8rn+2jr+Cbrgkhsr05CDrfIEWS11xRHTHVha37y5qNO7TIdFqRwjo59R/\nE76VX7xCch65zwUTCXwtS8pcEHIkXJQs4IngzY9nHwKBgQD1LA86XEcQU9TWS8jv\nCODdn00LOQgfZiIdiDFx7p7wiDD7HTJHHlBj5nnwISI60QhHE5IZnWWGIUAjGO9i\n4W+BPg59QpLPvcgYryloBRUrMeBZsF7NCTBEwP7+btOv7g7gKhHFwFK1xVn+arCJ\n/TNAdF5RCah/lnQhsDCB27JN/wKBgQDatLAAuDFpFZBHOVBK1EjelGzhuOIvsgD8\nJrRyV0EosElDS1npuo8t+V+ajdoBq0iGfhSWTYzRoP5by95lxl52qe87DvbA/Ty5\nRbwNZeSTLru1lNd4/Pe/7zOOyilLvcYdNqoGEmOUXt9BIymJU/7Jds61y4QZNBbE\n7MNl/NVqDwKBgQCaWUmg+TU3/z7wRrfSXOmMPNz5IseNVPRHWVWfn5VqYqNLhD8B\n7QC5VAESfxmYo76tWJHTFHc08Tv6nJkgzEIxwIrIqx/YL2eIusW7me+QyQ6wCEw2\nkwFTV5lxPv6ANMQitfmIYKLxkrQsaqiHxuL8QgaayBTPdj3Yc56mMlTXqwKBgQDQ\nxJAJb8oCtInP4z7o3zFb/rTc1x5aRwG3sL6pMu9JBtY4fZIrkWEhkp0XLHdBBp6p\ne2rtesOES7jiKX53Cl+byGVLq+IRoOo5NP7ojy4c7QxTrevtWxSny48cq4+19EZM\nFqVAPId/1vwn8oewxlQ9PcLeOJI1eMqPWi6/iRSzMwKBgD40cVe8qhUQq3RtORTH\nglsVPX7j8IWYSOcQXmC8GLEfqe+85DrmDc4vfYyko3eDJjlQeskCK67ggYtNM82+\nfFJBEM+lendQH2vvb3t2mT/peOXnNGq3hHohboUhb3Lw8iexkpflKvNLUnOlRP6f\nAXDlNYRL8AETSyCSQCkQCcwd\n-----END PRIVATE KEY-----\n",
  }),
  projectId: process.env.FIREBASE_PROJECT_ID || "kelly-fitness-93e58",
};

// Initialize the app
const app = !getApps().length
  ? initializeApp(firebaseAdminConfig)
  : getApps()[0];

// Export services
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

// Utility function to verify Firebase ID token
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    throw error;
  }
}

// Utility function to get user by UID
export async function getUserByUid(uid: string) {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export default app;
