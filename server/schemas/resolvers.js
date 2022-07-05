const { User, Book } = require('../models')
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
         .select('-__v -password')
         .populate('savedBooks')
        
        return userData;
      }
      throw new AuthenticationError('not logged in');
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user)
  
      return { token, user };
  
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
  
      if (!user) {
          throw new AuthenticationError('Incorrect credentials');
      }
      const correctPw = await user.isCorrectPassword(password);
  
      if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
      }
  
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        const addBook = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: book }},
          { new: true }
        );
        return addBook;
      }
      throw new AuthenticationError('you need to be logged in');
    },
    removeBook: async (parent, { book }, context) => {
      if (context.user) {
        const deleteBook = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: book }},
          { new: true }
        );
        return deleteBook;
        }
        throw new AuthenticationError('you need to be logged in')
    }
  }
};

module.exports = resolvers;