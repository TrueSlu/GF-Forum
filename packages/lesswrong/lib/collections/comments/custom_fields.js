import { Comments } from "./collection";
import Users from "meteor/vulcan:users";
import { makeEditable } from '../../editor/make_editable.js'
import { Posts } from '../posts';
import { generateIdResolverSingle, generateIdResolverMulti, addFieldsDict } from '../../modules/utils/schemaUtils'
import { schemaDefaultValue } from '../../collectionUtils';

export const moderationOptionsGroup = {
  order: 50,
  name: "moderation",
  label: "Moderator Options",
  startCollapsed: true
};

addFieldsDict(Comments, {
  // The comment author's `_id`
  userId: {
      type: String,
      optional: true,
      canRead: ['guests'],
      canCreate: ['members'],
      hidden: true,
      resolveAs: {
        fieldName: 'user',
        type: 'User',
        resolver: generateIdResolverSingle(
          {collectionName: 'Users', fieldName: 'userId'}
        ),
        addOriginalField: true
      },
  },

  // Legacy: Boolean used to indicate that post was imported from old LW database
  legacy: {
      type: Boolean,
      optional: true,
      hidden: true,
      ...schemaDefaultValue(false),
      canRead: ['guests'],
      canUpdate: [Users.owns, 'sunshineRegiment', 'admins'],
      canCreate: ['members'],
  },

  // Legacy ID: ID used in the original LessWrong database
  legacyId: {
      type: String,
      hidden: true,
      optional: true,
      canRead: ['guests'],
      canUpdate: [Users.owns, 'sunshineRegiment', 'admins'],
      canCreate: ['members'],
  },

  // Legacy Poll: Boolean to indicate that original LW data had a poll here
  legacyPoll: {
      type: Boolean,
      optional: true,
      hidden: true,
      defaultValue: false,
      canRead: ['guests'],
      canUpdate: [Users.owns, 'sunshineRegiment', 'admins'],
      canCreate: ['members'],
  },

  // Legacy Parent Id: Id of parent comment in original LW database
  legacyParentId: {
      type: String,
      hidden: true,
      optional: true,
      canRead: ['guests'],
      canUpdate: [Users.owns, 'sunshineRegiment', 'admins'],
      canCreate: ['members'],
  },

  // legacyData: A complete dump of all the legacy data we have on this post in a
  // single blackbox object. Never queried on the client, but useful for a lot
  // of backend functionality, and simplifies the data import from the legacy
  // LessWrong database
  legacyData: {
      type: Object,
      optional: true,
      canRead: ['admins'],
      canCreate: ['admins'],
      canUpdate: ['admins'],
      hidden: true,
      blackbox: true,
  },

  // retracted: Indicates whether a comment has been retracted by its author.
  // Results in the text of the comment being struck-through, but still readable.
  retracted: {
      type: Boolean,
      optional: true,
      canRead: ['guests'],
      canCreate: Users.owns,
      canUpdate: [Users.owns, 'sunshineRegiment', 'admins'],
      control: "checkbox",
      hidden: true,
      ...schemaDefaultValue(false),
  },

  // deleted: Indicates whether a comment has been deleted by an admin.
  // Deleted comments and their replies are not rendered by default.
  deleted: {
      type: Boolean,
      optional: true,
      canRead: ['guests'],
      canCreate: ['members'],
      canUpdate: [Users.owns, 'sunshineRegiment', 'admins'],
      control: "checkbox",
      hidden: true,
      ...schemaDefaultValue(false),
  },

  deletedPublic: {
      type: Boolean,
      optional: true,
      canRead: ['guests'],
      canCreate: ['members'],
      canUpdate: [Users.owns, 'sunshineRegiment', 'admins'],
      hidden: true,
      ...schemaDefaultValue(false),
  },

  deletedReason: {
      type: String,
      optional: true,
      canRead: ['guests'],
      canCreate: ['members'],
      canUpdate: [Users.owns, 'sunshineRegiment', 'admins'],
      hidden: true,
  },

  deletedDate: {
      type: Date,
      optional: true,
      canRead: ['guests'],
      canCreate: ['members'],
      canUpdate: ['sunshineRegiment', 'admins'],
      onEdit: (modifier, document, currentUser) => {
        if (modifier.$set && (modifier.$set.deletedPublic || modifier.$set.deleted)) {
          return new Date()
        }
      },
      hidden: true,
  },

  deletedByUserId: {
      type: String,
      optional: true,
      canRead: ['guests'],
      canUpdate: ['sunshineRegiment', 'admins'],
      canCreate: ['members'],
      hidden: true,
      onEdit: (modifier, document, currentUser) => {
        if (modifier.$set && (modifier.$set.deletedPublic || modifier.$set.deleted) && currentUser) {
          return modifier.$set.deletedByUserId || currentUser._id
        }
      },
      resolveAs: {
        fieldName: 'deletedByUser',
        type: 'User',
        resolver: generateIdResolverSingle(
          {collectionName: 'Users', fieldName: 'deletedByUserId'}
        ),
        addOriginalField: true
      },
  },

  // spam: Indicates whether a comment has been marked as spam.
  // This removes the content of the comment, but still renders replies.
  spam: {
      type: Boolean,
      optional: true,
      canRead: ['guests'],
      canCreate: ['admins'],
      canUpdate: ['admins'],
      control: "checkbox",
      hidden: true,
      ...schemaDefaultValue(false),
  },

  // repliesBlockedUntil: Deactivates replying to this post by anyone except
  // admins and sunshineRegiment members until the specified time is reached.
  repliesBlockedUntil: {
      type: Date,
      optional: true,
      group: moderationOptionsGroup,
      canRead: ['guests'],
      canUpdate: ['sunshineRegiment', 'admins'],
      control: 'datetime'
  },

  needsReview: {
      type: Boolean,
      optional: true,
      canRead: ['guests'],
      canUpdate: ['sunshineRegiment', 'admins'],
      canCreate: ['sunshineRegiment', 'admins'],
      hidden: true,
  },

  reviewedByUserId: {
      type: String,
      optional: true,
      canRead: ['guests'],
      canUpdate: ['sunshineRegiment', 'admins'],
      canCreate: ['sunshineRegiment', 'admins'],
      hidden: true,
      resolveAs: {
        fieldName: 'reviewedByUser',
        type: 'User',
        resolver: generateIdResolverSingle(
          {collectionName: 'Users', fieldName: 'reviewedByUserId'}
        ),
        addOriginalField: true
      },
  },

  // hideAuthor: Displays the author as '[deleted]'. We use this to copy over
  // old deleted comments from LW 1.0
  hideAuthor: {
      type: Boolean,
      group: moderationOptionsGroup,
      optional: true,
      canRead: ['guests'],
      canUpdate: ['admins'],
      ...schemaDefaultValue(false),
  },
});

export const makeEditableOptions = {
    // Determines whether to use the comment editor configuration (e.g. Toolbars)
    commentEditor: true,
    // Determines whether to use the comment editor styles (e.g. Fonts)
    commentStyles: true,
    // Sets the algorithm for determing what storage ids to use for local storage management
    getLocalStorageId: (comment, name) => {
      if (comment._id) { return {id: comment._id, verify: true} }
      if (comment.parentCommentId) { return {id: ('parent:' + comment.parentCommentId), verify: false}}
      if (comment.postId) { return {id: ('post:' + comment.postId), verify: false}}
    },
    order: 25
  }

makeEditable({
  collection: Comments,
  options: makeEditableOptions
})

addFieldsDict(Users, {
  // Count of the user's comments
  commentCount: {
      type: Number,
      optional: true,
      defaultValue: 0,
      canRead: ['guests'],
  }
});

addFieldsDict(Posts, {
  // Count of the post's comments
  commentCount: {
      type: Number,
      optional: true,
      defaultValue: 0,
      canRead: ['guests'],
  },
  // An array containing the `_id`s of commenters
  commenterIds: {
      type: Array,
      optional: true,
      resolveAs: {
        fieldName: 'commenters',
        type: '[User]',
        resolver: generateIdResolverMulti(
          {collectionName: 'Users', fieldName: 'commenterIds'}
        ),
      },
      canRead: ['guests'],
  },
  'commenterIds.$': {
      type: String,
      optional: true
  }
});
