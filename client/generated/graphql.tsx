import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassword: UserResponse;
  createPost: PostResponse;
  deletePost: Scalars['Boolean'];
  forgotPassword: Scalars['Boolean'];
  login: UserResponse;
  logout: Scalars['Boolean'];
  register: UserResponse;
  reply: ReplyResponse;
  updatePost: PostResponse;
  vote: Scalars['Boolean'];
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String'];
  reTypePassword: Scalars['String'];
  token: Scalars['String'];
};


export type MutationCreatePostArgs = {
  input: PostInput;
};


export type MutationDeletePostArgs = {
  id: Scalars['Int'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
};


export type MutationLoginArgs = {
  options: UsernamePasswordInput;
};


export type MutationRegisterArgs = {
  options: UsernamePasswordInput;
};


export type MutationReplyArgs = {
  replyId: Scalars['Int'];
  text: Scalars['String'];
};


export type MutationUpdatePostArgs = {
  id: Scalars['Int'];
  input: PostInput;
};


export type MutationVoteArgs = {
  postId: Scalars['Int'];
  value: Scalars['Int'];
};

export type PaginatedPosts = {
  __typename?: 'PaginatedPosts';
  hasMore: Scalars['Boolean'];
  posts: Array<Post>;
};

export type Post = {
  __typename?: 'Post';
  createdAt: Scalars['String'];
  creator: User;
  creatorId: Scalars['Int'];
  id: Scalars['Int'];
  points: Scalars['Int'];
  repliedTo?: Maybe<Post>;
  replies?: Maybe<Array<Post>>;
  replyId?: Maybe<Scalars['Int']>;
  text: Scalars['String'];
  textSnippet: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['String'];
  voteStatus?: Maybe<Scalars['Int']>;
};

export type PostInput = {
  text: Scalars['String'];
  title: Scalars['String'];
};

export type PostResponse = {
  __typename?: 'PostResponse';
  errors?: Maybe<Array<FieldError>>;
  post?: Maybe<Post>;
};

export type Query = {
  __typename?: 'Query';
  getAllUsers: Array<User>;
  me?: Maybe<User>;
  post?: Maybe<Post>;
  posts: PaginatedPosts;
};


export type QueryPostArgs = {
  id: Scalars['Int'];
};


export type QueryPostsArgs = {
  cursor: Scalars['String'];
  limit: Scalars['Int'];
};

export type ReplyResponse = {
  __typename?: 'ReplyResponse';
  errors?: Maybe<Array<FieldError>>;
  success?: Maybe<Scalars['Boolean']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String'];
  email: Scalars['String'];
  id: Scalars['Int'];
  updatedAt: Scalars['String'];
  username: Scalars['String'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type UsernamePasswordInput = {
  email?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  username: Scalars['String'];
};

export const RegularUserFragmentDoc = gql`
    fragment RegularUser on User {
  id
  username
  email
}
    `;
export const PostSnippetFragmentDoc = gql`
    fragment PostSnippet on Post {
  id
  title
  text
  voteStatus
  points
  creatorId
  creator {
    ...RegularUser
  }
  createdAt
  updatedAt
  replyId
  textSnippet
}
    ${RegularUserFragmentDoc}`;
export const PostsSnippetFragmentDoc = gql`
    fragment PostsSnippet on Post {
  id
  title
  text
  points
  creatorId
  creator {
    id
    username
  }
  createdAt
  updatedAt
  voteStatus
  textSnippet
}
    `;
export const RegularErrorFragmentDoc = gql`
    fragment RegularError on FieldError {
  field
  message
}
    `;
export const RegularUserResponseFragmentDoc = gql`
    fragment RegularUserResponse on UserResponse {
  errors {
    ...RegularError
  }
  user {
    ...RegularUser
  }
}
    ${RegularErrorFragmentDoc}
${RegularUserFragmentDoc}`;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($reTypePassword: String!, $newPassword: String!, $token: String!) {
  changePassword(
    reTypePassword: $reTypePassword
    newPassword: $newPassword
    token: $token
  ) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useChangePasswordMutation() {
  return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument);
};
export const CreatePostDocument = gql`
    mutation CreatePost($input: PostInput!) {
  createPost(input: $input) {
    errors {
      ...RegularError
    }
  }
}
    ${RegularErrorFragmentDoc}`;

export function useCreatePostMutation() {
  return Urql.useMutation<CreatePostMutation, CreatePostMutationVariables>(CreatePostDocument);
};
export const DeletePostDocument = gql`
    mutation DeletePost($deletePostId: Int!) {
  deletePost(id: $deletePostId)
}
    `;

export function useDeletePostMutation() {
  return Urql.useMutation<DeletePostMutation, DeletePostMutationVariables>(DeletePostDocument);
};
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;

export function useForgotPasswordMutation() {
  return Urql.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument);
};
export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(options: {username: $username, password: $password}) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const RegisterDocument = gql`
    mutation Register($options: UsernamePasswordInput!) {
  register(options: $options) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
};
export const ReplyDocument = gql`
    mutation Reply($replyId: Int!, $text: String!) {
  reply(replyId: $replyId, text: $text) {
    errors {
      ...RegularError
    }
    success
  }
}
    ${RegularErrorFragmentDoc}`;

export function useReplyMutation() {
  return Urql.useMutation<ReplyMutation, ReplyMutationVariables>(ReplyDocument);
};
export const UpdatePostDocument = gql`
    mutation UpdatePost($input: PostInput!, $updatePostId: Int!) {
  updatePost(input: $input, id: $updatePostId) {
    errors {
      field
      message
    }
    post {
      id
      title
      text
      textSnippet
    }
  }
}
    `;

export function useUpdatePostMutation() {
  return Urql.useMutation<UpdatePostMutation, UpdatePostMutationVariables>(UpdatePostDocument);
};
export const VoteDocument = gql`
    mutation Vote($value: Int!, $postId: Int!) {
  vote(value: $value, postId: $postId)
}
    `;

export function useVoteMutation() {
  return Urql.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument);
};
export const MeDocument = gql`
    query Me {
  me {
    ...RegularUser
  }
}
    ${RegularUserFragmentDoc}`;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery, MeQueryVariables>({ query: MeDocument, ...options });
};
export const PostDocument = gql`
    query Post($postId: Int!) {
  post(id: $postId) {
    id
    title
    text
    voteStatus
    points
    creatorId
    creator {
      id
      createdAt
      updatedAt
      email
      username
    }
    createdAt
    updatedAt
    replyId
    textSnippet
    replies {
      id
      title
      text
      voteStatus
      points
      creatorId
      creator {
        id
        createdAt
        updatedAt
        email
        username
      }
      createdAt
      updatedAt
      replyId
      textSnippet
      replies {
        id
        title
        text
        voteStatus
        points
        creatorId
        creator {
          id
          createdAt
          updatedAt
          email
          username
        }
        createdAt
        updatedAt
        replyId
        replies {
          id
          title
          text
          voteStatus
          points
          creatorId
          createdAt
          updatedAt
          replyId
          textSnippet
        }
        repliedTo {
          id
          title
          text
          voteStatus
          points
          creatorId
          createdAt
          updatedAt
          replyId
          textSnippet
        }
        textSnippet
      }
    }
  }
}
    `;

export function usePostQuery(options: Omit<Urql.UseQueryArgs<PostQueryVariables>, 'query'>) {
  return Urql.useQuery<PostQuery, PostQueryVariables>({ query: PostDocument, ...options });
};
export const PostsDocument = gql`
    query Posts($cursor: String!, $limit: Int!) {
  posts(cursor: $cursor, limit: $limit) {
    posts {
      ...PostSnippet
    }
    hasMore
  }
}
    ${PostSnippetFragmentDoc}`;

export function usePostsQuery(options: Omit<Urql.UseQueryArgs<PostsQueryVariables>, 'query'>) {
  return Urql.useQuery<PostsQuery, PostsQueryVariables>({ query: PostsDocument, ...options });
};
export type PostSnippetFragment = { __typename?: 'Post', id: number, title?: string | null, text: string, voteStatus?: number | null, points: number, creatorId: number, createdAt: string, updatedAt: string, replyId?: number | null, textSnippet: string, creator: { __typename?: 'User', id: number, username: string, email: string } };

export type PostsSnippetFragment = { __typename?: 'Post', id: number, title?: string | null, text: string, points: number, creatorId: number, createdAt: string, updatedAt: string, voteStatus?: number | null, textSnippet: string, creator: { __typename?: 'User', id: number, username: string } };

export type RegularErrorFragment = { __typename?: 'FieldError', field: string, message: string };

export type RegularUserFragment = { __typename?: 'User', id: number, username: string, email: string };

export type RegularUserResponseFragment = { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', id: number, username: string, email: string } | null };

export type ChangePasswordMutationVariables = Exact<{
  reTypePassword: Scalars['String'];
  newPassword: Scalars['String'];
  token: Scalars['String'];
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', id: number, username: string, email: string } | null } };

export type CreatePostMutationVariables = Exact<{
  input: PostInput;
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'PostResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type DeletePostMutationVariables = Exact<{
  deletePostId: Scalars['Int'];
}>;


export type DeletePostMutation = { __typename?: 'Mutation', deletePost: boolean };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword: boolean };

export type LoginMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', id: number, username: string, email: string } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RegisterMutationVariables = Exact<{
  options: UsernamePasswordInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', id: number, username: string, email: string } | null } };

export type ReplyMutationVariables = Exact<{
  replyId: Scalars['Int'];
  text: Scalars['String'];
}>;


export type ReplyMutation = { __typename?: 'Mutation', reply: { __typename?: 'ReplyResponse', success?: boolean | null, errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null } };

export type UpdatePostMutationVariables = Exact<{
  input: PostInput;
  updatePostId: Scalars['Int'];
}>;


export type UpdatePostMutation = { __typename?: 'Mutation', updatePost: { __typename?: 'PostResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, post?: { __typename?: 'Post', id: number, title?: string | null, text: string, textSnippet: string } | null } };

export type VoteMutationVariables = Exact<{
  value: Scalars['Int'];
  postId: Scalars['Int'];
}>;


export type VoteMutation = { __typename?: 'Mutation', vote: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, username: string, email: string } | null };

export type PostQueryVariables = Exact<{
  postId: Scalars['Int'];
}>;


export type PostQuery = { __typename?: 'Query', post?: { __typename?: 'Post', id: number, title?: string | null, text: string, voteStatus?: number | null, points: number, creatorId: number, createdAt: string, updatedAt: string, replyId?: number | null, textSnippet: string, creator: { __typename?: 'User', id: number, createdAt: string, updatedAt: string, email: string, username: string }, replies?: Array<{ __typename?: 'Post', id: number, title?: string | null, text: string, voteStatus?: number | null, points: number, creatorId: number, createdAt: string, updatedAt: string, replyId?: number | null, textSnippet: string, creator: { __typename?: 'User', id: number, createdAt: string, updatedAt: string, email: string, username: string }, replies?: Array<{ __typename?: 'Post', id: number, title?: string | null, text: string, voteStatus?: number | null, points: number, creatorId: number, createdAt: string, updatedAt: string, replyId?: number | null, textSnippet: string, creator: { __typename?: 'User', id: number, createdAt: string, updatedAt: string, email: string, username: string }, replies?: Array<{ __typename?: 'Post', id: number, title?: string | null, text: string, voteStatus?: number | null, points: number, creatorId: number, createdAt: string, updatedAt: string, replyId?: number | null, textSnippet: string }> | null, repliedTo?: { __typename?: 'Post', id: number, title?: string | null, text: string, voteStatus?: number | null, points: number, creatorId: number, createdAt: string, updatedAt: string, replyId?: number | null, textSnippet: string } | null }> | null }> | null } | null };

export type PostsQueryVariables = Exact<{
  cursor: Scalars['String'];
  limit: Scalars['Int'];
}>;


export type PostsQuery = { __typename?: 'Query', posts: { __typename?: 'PaginatedPosts', hasMore: boolean, posts: Array<{ __typename?: 'Post', id: number, title?: string | null, text: string, voteStatus?: number | null, points: number, creatorId: number, createdAt: string, updatedAt: string, replyId?: number | null, textSnippet: string, creator: { __typename?: 'User', id: number, username: string, email: string } }> } };
