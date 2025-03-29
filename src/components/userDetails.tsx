import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Flag,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { wicf_member, user } from "@prisma/client";
import shared_countries, {
  shared_countries_returnName,
} from "@/shared/shared_countries";

type UserProfileProps = {
  member: wicf_member & { user: user };
};
export function UserDetails({ member }: UserProfileProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <Avatar className="w-20 h-20">
          <AvatarImage
            src={`https://api.dicebear.com/6.x/initials/svg?seed=${member.first_name}`}
            alt={`${member.first_name} ${member.last_name}`}
          />
          <AvatarFallback>
            {member.first_name[0]}
            {member.last_name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-2xl">
            {member.first_name} {member.last_name}
          </CardTitle>
          <div className="flex space-x-2 mt-2">
            <Badge variant={member.user?.is_verified ? "default" : "secondary"}>
              {member.user?.is_verified ? "Verified" : "Unverified"}
            </Badge>
            {member.is_new_member && (
              <Badge variant="outline">New Member</Badge>
            )}
            {member.user?.is_banned && (
              <Badge variant="destructive">Banned</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4" />
              <span className="font-medium">User ID:</span>
              <span>{member.id}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Email:</span>
              <span>{member.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Phone:</span>
              <span>{member.phone_number}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Flag className="w-4 h-4" />
              <span className="font-medium">Nationality:</span>
              <span>
                {member.nationality &&
                  shared_countries_returnName(member.nationality)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">WeChat ID:</span>
              <span>{member.wechat_id}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">New Member Acknowledged:</span>
              <span>{member.is_new_member_acknowledged ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Registration Last Step:</span>
              <span>{member.registration_last_step}</span>
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <h3 className="font-semibold">Registration Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Clock className="w-4 h-4 inline-block mr-2" />
              <span className="font-medium">Start Time:</span>
              <div>
                {member.registration_start_time &&
                  formatDate(member.registration_start_time)}
              </div>
            </div>
            <div>
              <Clock className="w-4 h-4 inline-block mr-2" />
              <span className="font-medium">Last Update:</span>
              <div>
                {member.registration_last_update_time &&
                  formatDate(member.registration_last_update_time)}
              </div>
            </div>
            <div>
              <Clock className="w-4 h-4 inline-block mr-2" />
              <span className="font-medium">Completion Time:</span>
              <div>
                {member.registration_completion_time &&
                  formatDate(member.registration_completion_time)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
