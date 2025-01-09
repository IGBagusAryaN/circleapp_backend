"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_route_1 = __importDefault(require("../v1/users.route"));
const auth_route_1 = __importDefault(require("../v1/auth.route"));
const thread_route_1 = __importDefault(require("../v1/thread.route"));
const follow_route_1 = __importDefault(require("../v1/follow.route"));
const like_route_1 = __importDefault(require("../v1/like.route"));
const reply_route_1 = __importDefault(require("../v1/reply.route"));
const profile_route_1 = __importDefault(require("../v1/profile.route"));
const suggest_route_1 = __importDefault(require("../v1/suggest.route"));
const search_route_1 = __importDefault(require("../v1/search.route"));
const router = (0, express_1.default)();
router.use('/users', users_route_1.default);
router.use('/auth', auth_route_1.default);
router.use('/thread', thread_route_1.default);
router.use('/follow', follow_route_1.default);
router.use('/like', like_route_1.default);
router.use('/reply', reply_route_1.default);
router.use('/profile', profile_route_1.default);
router.use('/suggest', suggest_route_1.default);
router.use('/search', search_route_1.default);
// router.use('/uploads', express.static(path.join(__dirname, '../../middlewares/uploads')));
exports.default = router;