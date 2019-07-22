import { Components, registerComponent, withUpdate, getSetting } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Users from 'meteor/vulcan:users';
import { QueryLink } from '../../lib/reactRouterWrapper.js'

import withUser from '../common/withUser';
import { DEFAULT_LOW_KARMA_THRESHOLD, MAX_LOW_KARMA_THRESHOLD } from '../../lib/collections/posts/views'

import { sortings as defaultSortings, timeframes as defaultTimeframs } from './AllPostsPage.jsx'

const FILTERS_ALL = {
  "AlignmentForum": {
    all: {
      label: "All Posts",
      tooltip: "Includes all posts"
    },
    questions: {
      label: "Questions",
      tooltip: "Open questions and answers, ranging from newbie-questions to important unsolved scientific problems."
    },
    meta: {
      label: "Meta",
      tooltip: "Posts relating to LessWrong itself"
    },
  },
  "LessWrong": {
    all: {
      label: "All Posts",
      tooltip: "Includes personal blogposts as well as frontpage, curated, questions, events and meta posts."
    },
    frontpage: {
      label: "Frontpage",
      tooltip: "Moderators add posts to the frontpage if they meet certain criteria: aiming to explain, rather than persuade, and avoiding identity politics."
    },
    curated: {
      label: "Curated",
      tooltip: "Posts chosen by the moderation team to be well written and important (approximately 3 per week)"
    },
    questions: {
      label: "Questions",
      tooltip: "Open questions and answers, ranging from newbie-questions to important unsolved scientific problems."
    },
    events: {
      label: "Events",
      tooltip: "Events from around the world."
    },
    meta: {
      label: "Meta",
      tooltip: "Posts relating to LessWrong itself"
    },
  },
  "EAForum": {
    all: {
      label: "All Posts",
      tooltip: "Includes personal blogposts as well as frontpage, questions, and community posts."
    },
    frontpage: {
      label: "Frontpage",
      tooltip: "Material selected by moderators as especially interesting or useful to people with interest in doing good effectively."
    },
    questions: {
      label: "Questions",
      tooltip: "Open questions and answers, ranging from newcomer questions to important unsolved scientific problems."
    },
    meta: {
      label: "Community",
      tooltip: "Posts with topical content or relating to the EA community itself"
    },
  }
}
const FILTERS = FILTERS_ALL[getSetting('forumType')]

const styles = theme => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottom:"solid 2px rgba(0,0,0,.6)",
    marginBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit*5,
    paddingRight: theme.spacing.unit*4,
    paddingTop: theme.spacing.unit/2,
    paddingBottom: theme.spacing.unit*2,
    flexWrap: "wrap",
    marginLeft: 3,
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing.unit*2,
      paddingRight: theme.spacing.unit*2,
    }
  },
  hidden: {
    display: "none", // Uses CSS to show/hide
    overflow: "hidden",
  },
  menuItem: {
    display: "block",
    cursor: "pointer",
    color: theme.palette.grey[500],
    marginLeft: theme.spacing.unit*1.5,
    whiteSpace: "nowrap",
    '&:hover': {
      color: theme.palette.grey[600],
    },
  },
  selectionList: {
    marginRight: theme.spacing.unit*2,
    [theme.breakpoints.down('xs')]: {
      flex: `1 0 calc(50% - ${theme.spacing.unit*4}px)`,
      order: 1
    }
  },
  selectionTitle: {
    display: "block",
    fontStyle: "italic",
    marginBottom: theme.spacing.unit/2
  },
  selected: {
    color: theme.palette.grey[900],
    '&:hover': {
      color: theme.palette.grey[900],
    },
  },
  checkbox: {
    padding: "1px 12px 0 0"
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing.unit*2,
      flex: `1 0 100%`,
      order: 0
    }
  },
})

const SettingsColumn = ({type, title, options, currentOption, classes, setSetting}) => {
  const { MetaInfo } = Components

  return <div className={classes.selectionList}>
    <MetaInfo className={classes.selectionTitle}>
      {title}
    </MetaInfo>
    {Object.entries(options).map(([name, optionValue]) => {
      const label = _.isString(optionValue) ? optionValue : optionValue.label
      return (
        <QueryLink
          key={name}
          onClick={() => setSetting(type, name)}
          // TODO: Can the query have an ordering that matches the column ordering?
          query={{ [type]: name }}
          merge
        >
          <MetaInfo className={classNames(classes.menuItem, {[classes.selected]: currentOption === name})}>
            {optionValue.tooltip ?
              <Tooltip title={<div>{optionValue.tooltip}</div>} placement="left-start">
                <span>{ label }</span>
              </Tooltip> :
              // TODO-Q-ForPR Anyone want to tell me how I can be smarter about
              // conditionally rendering that tooltip?
              <span>{ label }</span>
            }
          </MetaInfo>
        </QueryLink>
      )
    })}
  </div>
}

const USER_SETTING_NAMES = {
  timeframe: 'allPostsTimeframe',
  sortedBy: 'allPostsSorting',
  filter: 'allPostsFilter',
  showLowKarma: 'allPostsShowLowKarma',
}

class PostsListSettings extends Component {

  setSetting = (type, newSetting) => {
    const { updateUser, currentUser, persistentSettings } = this.props
    if (currentUser && persistentSettings) {
      updateUser({
        selector: { _id: currentUser._id},
        data: {
          [USER_SETTING_NAMES[type]]: newSetting,
        },
      })
    }
  }

  render () {
    const {
      classes, hidden, currentTimeframe, currentSorting, currentFilter, currentShowLowKarma,
      timeframes = defaultTimeframs, sortings = defaultSortings, showTimeframe
    } = this.props
    const { MetaInfo } = Components

    return (
      <div className={classNames(classes.root, {[classes.hidden]: hidden})}>
        {/* TODO-Q-ForPR Does anyone notice the spacing bothering them? */}
        {showTimeframe && <SettingsColumn
          type={'timeframe'}
          title={'Timeframe:'}
          options={timeframes}
          currentOption={currentTimeframe}
          setSetting={this.setSetting}
          classes={classes}
        />}

        <SettingsColumn
          type={'sortedBy'}
          title={'Sorted by:'}
          options={sortings}
          currentOption={currentSorting}
          setSetting={this.setSetting}
          classes={classes}
        />

        <SettingsColumn
          type={'filter'}
          title={'Filtered by:'}
          options={FILTERS}
          currentOption={currentFilter}
          setSetting={this.setSetting}
          classes={classes}
        />

        <Tooltip title={<div><div>By default, posts below -10 karma are hidden.</div><div>Toggle to show them.</div></div>} placement="right-start">
          <QueryLink
            className={classes.checkboxGroup}
            onClick={() => this.setSetting('showLowKarma', !currentShowLowKarma)}
            query={{karmaThreshold: (currentShowLowKarma ? DEFAULT_LOW_KARMA_THRESHOLD : MAX_LOW_KARMA_THRESHOLD)}}
            merge
          >
            <Checkbox classes={{root: classes.checkbox, checked: classes.checkboxChecked}} checked={currentShowLowKarma} />

            <MetaInfo className={classes.checkboxLabel}>
              Show Low Karma
            </MetaInfo>
          </QueryLink>
        </Tooltip>
      </div>
    );
  }
}

PostsListSettings.propTypes = {
  currentUser: PropTypes.object,
};

PostsListSettings.displayName = 'PostsListSettings';

const withUpdateOptions = {
  collection: Users,
  fragmentName: 'UsersCurrent',
}

registerComponent('PostsListSettings', PostsListSettings, withUser, withStyles(styles, {name:"PostsListSettings"}), [withUpdate, withUpdateOptions]);
