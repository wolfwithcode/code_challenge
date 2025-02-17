import express from 'express';
import validate from '@middlewares/validate';
import resourceValidation from '@main/resource/dto/resource.validation';
import resourceController from '@main/resource/resource.controller';
import auth from '@middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageResources'),
    validate(resourceValidation.createResource),
    resourceController.createResource
  );

router.route('/').get(validate(resourceValidation.getResources), resourceController.getResources);

router
  .route('/:id')
  .get(validate(resourceValidation.getResource), resourceController.getResource)
  .patch(validate(resourceValidation.updateResource), resourceController.updateResource)
  .delete(validate(resourceValidation.deleteResource), resourceController.deleteResource);

export default router;
