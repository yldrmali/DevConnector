const mongoose = require('mongoose');
const Profile=require('./Profile');
const Post = require('./Post');
const Schema = mongoose.Schema;
const chalk = require('chalk');

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

//save,init,remove are document queries and by default {document:true,query:false}
//findOneAndDelete,findById etc. are model queries and by default {query:false,document:true}



UserSchema.pre('findOneAndDelete',{query:true,document:false},async function(next){
  console.log(chalk.blue('this.getQuery is right below'));
  const id= await this.getQuery()._id
  console.log(chalk.red('id is====>'),id);
  await Profile.findOneAndDelete({user:id})
  await Post.deleteMany({user:id})
  next()
})

module.exports = mongoose.model('User', UserSchema);
