import React, { useState } from 'react';
import { CourseGroup } from '../lib/types/course';
import { GroupCard } from './GroupCard';
import { Tooltip } from './Tooltip';

interface Props {
    groups: CourseGroup[];
    onAddGroup: () => void;
    onUpdateGroup: (groupId: string, group: CourseGroup) => void;
    onDeleteGroup: (groupId: string) => void;
    globalMaxCourses?: number;
    lastAddedGroupId: string | null;
}

export function GroupList({ groups, onAddGroup, onUpdateGroup, onDeleteGroup, globalMaxCourses = 5, lastAddedGroupId }: Props) {
    return (
        <div className="group-list">
            <div className="group-list-header">
                <h2><Tooltip text="Groups allow you to set selection criteria for specific courses." />Course Groups</h2>
                <button onClick={onAddGroup} className="add-btn">+ Add Group</button>
            </div>

            {groups.length === 0 ? (
                <p className="empty-state">No groups yet. Add one to get started!</p>
            ) : (
                groups.map(group => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        onUpdate={updated => onUpdateGroup(group.id, updated)}
                        onDelete={() => onDeleteGroup(group.id)}
                        globalMaxCourses={globalMaxCourses}
                        autoFocus={group.id === lastAddedGroupId}
                    />
                ))
            )}
        </div>
    );
}