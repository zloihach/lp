const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenSerivce = require('./token-serivce');
const UserDto = require('../dtos/user-dto');

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email })
        if (candidate) {
            throw new Error('Пользователь с таким Email ${email} уже существует')
        }
        const hachPassword = await bcrypt.hash(password);
        const activationLink = uuid.v4();

        const user = await UserModel.create({ email, hashPassword, activationLink })
        await mailService.sendActivationMail(email, activationLink);

        const userDto = new UserDto(user);
        const tokens = tokenSerivce.generateToken({...userDto });
        await tokenSerivce.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto }
    }
}

module.exports = new UserService();