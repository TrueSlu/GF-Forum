import { TagRels } from './collection.js';
import { ensureIndex } from '../../collectionUtils';

TagRels.addView('postsWithTag', terms => {
  return {
    selector: {
      tagId: terms.tagId,
      baseScore: {$gt: 0},
    },
    sort: {baseScore: -1},
  }
});

TagRels.addView('tagsOnPost', terms => {
  return {
    selector: {
      postId: terms.postId,
      baseScore: {$gt: 0},
    },
    sort: {baseScore: -1},
  }
});

ensureIndex(TagRels, {postId:1});
ensureIndex(TagRels, {tagId:1});
