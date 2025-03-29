import type React from "react";

import type { NextPage } from "next";
import Head from "next/head";
import { api } from "@/utils/api";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users2Icon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
// import Image from "next/image";

const LeadershipPage: NextPage = () => {
  const {
    data: tenures,
    isLoading,
    error,
  } = api.leadershipTenure.getAll.useQuery();
  const [selectedTenure, setSelectedTenure] = useState<string | null>(null);

  const displayedTenures = selectedTenure
    ? tenures?.filter((tenure) => tenure.id === selectedTenure)
    : tenures;

  return (
    <>
      <Head>
        <title>WICF Leadership</title>
        <meta name="description" content="WICF Leadership Tenures" />
      </Head>

      <main
        className="container mx-auto px-4 py-12 w-full"
        // style={{ border: "1px solid red" }}
      >
        <div className="space-y-6 mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            WICF Leadership
          </h1>
          {error && <pre style={{ color: "red" }}>{error?.message}</pre>}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the dedicated leaders who have guided our community through the
            years
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <Badge
                variant={selectedTenure === null ? "default" : "outline"}
                className="cursor-pointer text-sm py-1 px-3"
                onClick={() => setSelectedTenure(null)}
              >
                All Tenures
              </Badge>
              {tenures?.map((tenure) => (
                <Badge
                  key={`filter-${tenure.id}`}
                  variant={selectedTenure === tenure.id ? "default" : "outline"}
                  className="cursor-pointer text-sm py-1 px-3"
                  onClick={() => setSelectedTenure(tenure.id)}
                >
                  {format(new Date(tenure.start_date), "yyyy")} -{" "}
                  {format(new Date(tenure.end_date), "yyyy")}
                </Badge>
              ))}
            </div>

            <div
              // className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full"
              className="flex flex-wrap gap-8 w-full"
            >
              {displayedTenures?.map((tenure, index) => (
                <motion.div
                  key={tenure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="w-full"
                  style={{ border: "1px solid #e0e0e0" }}
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-lg w-full">
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="text-2xl">{tenure.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(tenure.start_date), "MMMM yyyy")} -{" "}
                          {format(new Date(tenure.end_date), "MMMM yyyy")}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Users2Icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">
                          Leadership Team
                        </h3>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        {tenure.appointments?.map((appointment) => (
                          <LeaderProfile
                            key={appointment.id}
                            name={`${appointment.user?.wicf_member?.first_name} ${appointment.user?.wicf_member?.last_name}`}
                            email={appointment.user?.wicf_member?.email ?? ""}
                            phone={
                              appointment.user?.wicf_member?.phone_number ?? ""
                            }
                            image={appointment.user?.image ?? undefined}
                            position={appointment.position.label}
                            ministry={appointment.position.ministry?.label}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
};

interface LeaderProfileProps {
  name: string;
  email: string;
  phone: string;
  image?: string;
  position: string;
  ministry?: string;
}

const LeaderProfile: React.FC<LeaderProfileProps> = ({
  name,
  email,
  phone,
  image,
  position,
  ministry,
}) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-primary/20 p-6"
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20 bg-white shadow-lg">
          <img
            src={image ?? "/placeholder.svg"}
            alt={name}
            width={128}
            height={128}
            className="h-full w-full object-cover"
          />
        </div>
        <h3 className="mb-1 text-xl font-bold group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <h4 className="mb-1 text-xl font-bold group-hover:text-primary transition-colors duration-300">
          {email ?? ""}
        </h4>
        <h4 className="mb-1 text-xl font-bold group-hover:text-primary transition-colors duration-300">
          {phone ?? ""}
        </h4>
        {/* <Badge variant="secondary" className="mb-2">
          {position}
        </Badge> */}
        {ministry && (
          <p className="text-sm text-muted-foreground">
            {position ?? `${position}`} {ministry && `( ${ministry} Ministry )`}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const LoadingState = () => (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="w-full h-[400px] overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2].map((j) => (
              <div key={j} className="flex flex-col items-center space-y-3">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default LeadershipPage;
