import express from "express";

import * as authController from "../controllers/authController.js";
import * as friendController from "../controllers/friendController.js";

const router = express.Router();

router.use(authController.protect);

/*
TODO:
✅ post      /freinds/:friendId              // send request
✅ get       /friends/requests               // list my pending incoming requests
✅ patch     /friends/:frinedId/accept       // accept request
✅ delete    /friends/:frinedId              // reject request OR remove friend (same action: delete the row)

get       /friends                           // list my accepted friends
get       /friends/mutual/:friendId          // mutual friends with someone

/////////////

✅ sendRequest  everything starts here
✅ getIncomingRequests 
✅ acceptRequest
✅ rejectRequest / remove friend (delete)

getFriends - list accepted friends
getMutualFriends 
*/
router
  .route("/:friendId")
  .post(friendController.sendRequest)
  .delete(friendController.removeConnection);

router.route("/requests").get(friendController.getIncomingRequests);
router.route("/:frinedId/accept").patch(friendController.acceptRequest);

export default router;
