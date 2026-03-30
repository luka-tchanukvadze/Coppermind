import express from "express";

import * as authController from "../controllers/authController.js";
import * as friendController from "../controllers/friendController.js";

const router = express.Router();

router.use(authController.protect);

/*
TODO:
✅ post      /freinds/:friendId             // send request

get       /friends                     // list my accepted friends
get       /friends/requests            // list my pending incoming requests
get       /friends/mutual/:friendId      // mutual friends with someone
patch     /friends/:id/accept          // accept request
delete    /friends/:id                 // reject request OR remove friend (same action: delete the row)


✅ sendRequest  everything starts here

getIncomingRequests 
acceptRequest
rejectRequest (delete)
getFriends - list accepted friends
removeFriend (delete)
getMutualFriends 
*/
router.route("/:friendId").post(friendController.sendRequest);

export default router;
