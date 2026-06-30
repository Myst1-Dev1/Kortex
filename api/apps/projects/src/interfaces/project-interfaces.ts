export interface IParticipants {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface ITasks {
    id: string;
    authorId: number;
    participantId: number;
    title: string;
    description: string;
    status: string;
    timeEstimated: Date;
    timeConcluded: Date;
    createdAt: Date;
    updatedAt: Date;
}