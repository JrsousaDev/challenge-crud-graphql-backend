import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(_type => ID)
  _id: string;

  @Field()
  name: string;

  @Field(_type => ID)
  email: string;

  @Field()
  password: string;
}

@ObjectType() 
export class UserAuthenticated {
  @Field(_type => ID)
  token: string;

  @Field(_type => ID)
  _id: string;

  @Field()
  name: string;

  @Field(_type => ID)
  email: string;
}