// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import nc from 'next-connect'
import onError from '../../../middleware/onError'
import connectDatabase from '../../../middleware/connectDatabase'
import User from '../../../models/User'

const handler = nc({
  onError 
});

export default handler
  .use(connectDatabase) // TODO: on every request method connectDatabase will run. Change to only run after authenticating and within a method hook
  .post((req, res, next) => {
    const {
      email,
      firstName,
      lastName,
      username,
      password
    } = req.body;

    // check if user email is unique
    return User.count({ email })
    .exec()
    .then(function(count) {
      if (count > 0) {
        throw {
          name: "ValidationError",
          errors: {
            email: { message: "The email is already taken" }
          }
        };
      }
      return count;
    })
    .then(() => {
      const user = new User({
        email,
        firstName,
        lastName,
        username,
      });

      user.setPassword(password);
      return user
        .save()
        .then(function(user) {
          // // TODO: send confirmation email
          // return mailgunService
          //   .sendWelcomeEmail(user.email, user.firstName, user.username)
          //   .then(() => {
          //     return req.login(user, () => res.json({ success: true, user: user.authSerialize() }));
          //   })
          return res.json({ success: true, user: user.authSerialize() });
        })
    })
    .catch(next);
  });