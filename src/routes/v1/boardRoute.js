import express from 'express';
import { boardValidation } from '~/validations/boardValidation';
import { boardController } from '~/controllers/boardController';
import { authMiddleware } from '~/middlewares/authMiddleware';
//import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware';

const Router = express.Router();

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(
    authMiddleware.isAuthorized,
    boardValidation.createNew,
    boardController.createNew
  );

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(
    authMiddleware.isAuthorized,
    //multerUploadMiddleware.upload.single('boardCover'),
    boardValidation.update,
    boardController.update
  );

// Route for moving a card to a different column
Router.route('/supports/moving_card').put(
  authMiddleware.isAuthorized,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
);
export const boardRoute = Router;
