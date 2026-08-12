export interface ProjectType {
id:string;
title:string;
isComplete: boolean;
userId: string ;
}
export interface TaskType extends ProjectType{
    time:string;
}