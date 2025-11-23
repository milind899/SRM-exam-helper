import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface UserNicknameProps {
    currentNickname: string;
    onUpdate: (name: string) => void;
}

export const UserNickname: React.FC<UserNicknameProps> = ({ currentNickname, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(currentNickname);

    const handleSave = () => {
        if (tempName.trim().length > 0 && tempName.length <= 20) {
            onUpdate(tempName.trim());
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 bg-surface/50 p-2 rounded-lg border border-white/10">
                <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-transparent border-none outline-none text-text-main font-bold w-32"
                    placeholder="Enter name"
                    maxLength={20}
                    autoFocus
                />
                <button onClick={handleSave} className="text-emerald-500 hover:text-emerald-400">
                    <Check size={18} />
                </button>
                <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-400">
                    <X size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group">
            <span className="text-lg font-bold text-text-main">{currentNickname}</span>
            <button
                onClick={() => {
                    setTempName(currentNickname);
                    setIsEditing(true);
                }}
                className="text-text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit Nickname"
            >
                <Edit2 size={14} />
            </button>
        </div>
    );
};
