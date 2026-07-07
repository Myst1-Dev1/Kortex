export interface IParticipants {
  id: string;
  name: string;
  email: string;
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

export interface IProject {
    id: string;
    author_id: string;
    name: string;
    description: string;
    status: string;
    participants: IParticipants[];
    tasks: ITasks[];
    createdAt: Date;
    updatedAt: Date;
}