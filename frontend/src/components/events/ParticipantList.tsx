import type { Participant } from "../../types";

interface ParticipantListProps {
  participants: Participant[];
}

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
};

export const ParticipantList = ({ participants }: ParticipantListProps) => {
  if (participants.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        No participants yet. Be the first to join!
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {participants.map((participant) => (
        <li key={participant.id} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(participant.firstName, participant.lastName)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">
              {participant.firstName} {participant.lastName}
            </span>
            <span className="text-xs text-gray-400">{participant.email}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};
