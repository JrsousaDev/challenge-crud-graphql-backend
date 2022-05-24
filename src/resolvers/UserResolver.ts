import { compare } from "bcryptjs";
import { Arg, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { User, UserAuthenticated } from "../models/User";
import { UserModel } from "../modules/mongodb/UserModel";

import jwt from 'jsonwebtoken';

@InputType() 
class CreateUserInput {
  @Field() 
  name!: string;

  @Field() 
  email!: string;

  @Field()
  password!: string;
}

@InputType() 
class UpdateUserInput {
  @Field()
  _id!: string;

  @Field({ nullable: true }) 
  name: string;

  @Field({ nullable: true }) 
  email: string;

  @Field({ nullable: true })
  password: string;
}

@InputType()
class CreateSessionInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

interface VerifyPassword {
  password: string;
  user: {
    password: string
  }
}

interface CreateToken {
  _id: string;
}

interface IEncode {
  _id: string;
}

@Resolver()
export class UserResolver {
  
  private async checkPassword({ password, user }: VerifyPassword): Promise<boolean> {
    return await compare(
      password.toString(),
      user.password.toString()
    )
  }

  private async createToken({ _id }: CreateToken) {
    function encode(data: IEncode) {
      return jwt.sign(data, process.env.JWT_SECRET as string);
    }

    return encode({ _id });
  }

  @Query(() => User) 
  async readOneUserEmail(
    @Arg('email') email: String
  ) {
    return await UserModel.findOne({email})
  }

  @Query(() => User) 
  async readOneUserID(
    @Arg('_id') _id: String
  ) {
    return await UserModel.findOne({_id})
  }

  @Mutation(() => User)
  async createUser(
    @Arg('userInput') userInput : CreateUserInput
  ) {
    const { email } = userInput;

    const user = await this.readOneUserEmail(email);
    if(user) throw new Error('User already exists!')

    return await UserModel.create(userInput)
  }

  @Query(() => [User]) 
  async readUsers() {
    return await UserModel.find();
  }

  @Mutation(() => User)
  async updateUser(
    @Arg('userInput') userInput : UpdateUserInput 
  ) {
    const { _id, email, name, password } = userInput;

    const user = await this.readOneUserID(_id);
    if(!user) throw new Error('User is not exist');

    const data = {
      email, 
      name,
      password
    }

    return await UserModel.findByIdAndUpdate(_id, data)
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Arg('_id') _id: string 
  ) {
    const user = await this.readOneUserID(_id);
    if(!user) throw new Error('User is not exists!');

    try {
      await UserModel.findByIdAndDelete(_id);
      return true;
    } catch (error) {
      throw new Error('Internal server error...')
    }
  }

  @Mutation(() => UserAuthenticated)
  async createSession(
    @Arg('createSessionInput') createSessionInput: CreateSessionInput
  ) {
    const { email, password } = createSessionInput;
    
    let user = null;

    if(email) {
      const emailLowerCase = email.toLocaleLowerCase();
      user = await this.readOneUserEmail(emailLowerCase);
    } else {
      throw new Error("E-mail não enviado");
    }

    if (user === null) throw new Error("E-mail ou senha podem estar incorretos!!");
    if (!password && !user?.password) throw new Error("E-mail ou senha podem estar incorretos!!")

    const validatePassword = await this.checkPassword({ password, user });
    if (!validatePassword) throw new Error ("E-mail ou senha podem estar incorretos!!");

    const userToReturn = user.toObject();
    if (userToReturn.password) {
      delete userToReturn?.password
    }

    const token = await this.createToken({ _id: user._id.toString() });

    return {
      token: `Bearer ${token}`,
      ...userToReturn
    }
  }
}

export const userResolver = new UserResolver();