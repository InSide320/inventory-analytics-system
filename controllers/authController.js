import userSchema from "../models/userSchema.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import config from "config";

export const getLogin = (req, res) => {
    if (req.session.email) return res.redirect('/');
    res.render('auth/login');

}

export const login = async (req, res) => {
    const {email, password} = req.body;
    const user = await userSchema.findOne({email});

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.username = user.username;
        req.session.email = user.email;
        req.session.role = user.role;
        return res.redirect('/');
    }

    res.render('auth/login', {error: 'Невірний логін або пароль'});
}

export const getRegistration = (req, res) => {
    if (req.session.email) return res.redirect('/');
    res.render('auth/registration');
}

export const registration = async (req, res) => {
    try {
        const {username, email, password, role} = req.body;
        const existingUser = await userSchema.findOne({email: email});
        console.error(existingUser);
        if (existingUser) {
            return res.render('/registration', {error: 'Емейл вже зареєстровано'});
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await userSchema.insertOne({
            username,
            email,
            password: hashPassword,
            role: role,
        });

        req.session.username = username;
        req.session.email = email;
        req.session.role = role;
        res.redirect('/');
    } catch (error) {
        console.error('Error during registration:', error);
        res.render('/registration', {error: 'An error occurred during registration'});
    }
}

export const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
}

export const getForgotPassword = (req, res) => {
    res.render('auth/forgot-password');
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body;
    const user = await userSchema.findOne({email});

    if (!user) {
        return res.render('auth/forgot-password', {error: 'Користувача з таким email не знайдено'});
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 30;

    await userSchema.updateOne(
        {email},
        {$set: {resetToken: token, resetExpires: expires}}
    );

    const resetLink = `http://localhost:${config.port}/auth/reset-password/${token}`;

    console.log('Відновлення пароля:', resetLink);

    res.render('auth/forgot-password', {message: 'Посилання для відновлення надіслано'});
}

export const getToken = async (req, res) => {
    const {token} = req.params;
    const user = await userSchema.findOne({
        resetToken: token,
        resetExpires: {$gt: Date.now()},
    });

    if (!user) {
        return res.render('auth/reset-password', {error: 'Недійсне або прострочене посилання'});
    }

    res.render('auth/reset-password', {token});
}

export const updatePassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const user = await userSchema.findOne({
        resetToken: token,
        resetExpires: {$gt: Date.now()},
    });

    if (!user) {
        return res.render('auth/reset-password', {error: 'Недійсне або прострочене посилання'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userSchema.updateOne(
        {_id: user._id},
        {
            $set: {password: hashedPassword},
            $unset: {resetToken: "", resetExpires: ""}
        }
    );

    res.redirect('/auth/login');
}