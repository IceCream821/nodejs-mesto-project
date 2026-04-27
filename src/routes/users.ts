import { Router } from 'express';
import {
  getCurrentUser,
  getUserById,
  getUsers,
  updateAvatar,
  updateProfile,
} from '../controllers/users';
import {
  updateAvatarCelebrate,
  updateProfileCelebrate,
  userIdParamCelebrate,
} from '../validators/schemas';

const router = Router();

router.get('/me', getCurrentUser);
router.patch('/me/avatar', updateAvatarCelebrate, updateAvatar);
router.patch('/me', updateProfileCelebrate, updateProfile);
router.get('/', getUsers);
router.get('/:userId', userIdParamCelebrate, getUserById);

export default router;
