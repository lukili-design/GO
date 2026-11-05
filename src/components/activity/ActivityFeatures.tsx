import React from 'react';
import type {Activity} from '../../types';
import {ActivityProjects} from './ActivityProjects';
export function ActivityFeatures({activity,activities}:{activity:Activity;activities:Activity[]}){
 return <ActivityProjects activity={activity} activities={activities}/>;
}
