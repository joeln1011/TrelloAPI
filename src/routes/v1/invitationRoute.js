import express from 'express';
import { invitationController } from '~/controllers/invitationController';
import { invitationValidation } from '~/validations/invitationValidation';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router();
Router.route('/board').post(
  authMiddleware.isAuthorized,
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation
);

export const invitationRoute = Router;
