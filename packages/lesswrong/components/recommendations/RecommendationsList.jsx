import React from 'react';
import { Components, registerComponent } from 'meteor/vulcan:core';
import { getFragment } from 'meteor/vulcan:core';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import withUser from '../common/withUser';

const withRecommendations = component => {
  const recommendationsQuery = gql`
    query RecommendationsQuery($count: Int, $method: String) {
      Recommendations(count: $count, method: $method) {
        ...PostsList
      }
    }
    ${getFragment("PostsList")}
  `;

  return graphql(recommendationsQuery,
    {
      alias: "withRecommendations",
      options: (props) => ({
        variables: {
          count: props.count || 10,
          method: props.method || "top",
        }
      }),
      props(props) {
        return {
          recommendationsLoading: props.data.loading,
          recommendations: props.data.Recommendations,
        }
      }
    }
  )(component);
}

const RecommendationsList = ({ recommendations, recommendationsLoading, currentUser }) => {
  const { PostsItem2 } = Components;
  if (recommendationsLoading || !recommendations)
    return <Components.PostsLoading/>
  
  return <div>{recommendations.map(post => <PostsItem2 post={post} key={post._id} currentUser={currentUser}/>)}</div>
}

registerComponent('RecommendationsList', RecommendationsList,
  withRecommendations,
  withUser
);

