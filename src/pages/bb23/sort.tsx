/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import {
  POST_bb23_teams_get,
  POST_bb23_teams_set_members,
  POST_bb23_user_set_sortable,
  POST_bb23_users_get,
} from "@/requests";
import { Button, Col, Row, Spin, Typography } from "antd";
import { useQuery } from "react-query";
import { DeviceScreen } from "@/styles/theme";
import { TypeBBTeam, TypeBBUser } from "@/shared/shared_types";
import {
  Dispatch,
  SetStateAction,
  // useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const IS_EDITABLE = true;

export interface PropsBBMember extends TypeBBUser {
  index: number;
  getMembers: () => void;
  isEditable?: boolean;
}
export function BBMember(props: PropsBBMember) {
  return (
    <Button
      ghost={!props.is_sortable}
      css={css({
        maxWidth: "100%",
        height: "fit-content",
        fontSize: 20,
        fontWeight: 800,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        textAlign: "center",
        border: `4px solid ${props.bb_team?.color_hex}`,
        [DeviceScreen.mobile]: {
          flexDirection: "column",
        },
      })}
      onClick={async () => {
        if (props.isEditable === true) {
          await toast
            .promise(
              POST_bb23_user_set_sortable({
                user_id: props.id,
                is_sortable: !props.is_sortable,
              }),
              {
                pending: "updating member...",
                // success: "Request Successful",
                error: "Request failed",
              },
            )
            .then(() => {
              props.getMembers();
            })
            .catch((e) => {
              console.error(e);
            });
        }
      }}
    >
      <span>{props.index + 0}.</span>
      <span>{`${props.first_name} ${
        props.last_name ?? `(${props.institution})`
      }`}</span>
      <span style={{ color: props?.bb_team?.color_hex }}>
        {props.bb_team?.name ?? "-"}
      </span>
    </Button>
  );
}

export interface PropsBBTeam extends TypeBBTeam {
  getTeams: () => void;
  getMembers: () => void;
  isEditable?: boolean;
}
export function BBTeam(props: PropsBBTeam) {
  return (
    <Col
      span={24}
      xl={8}
      xxl={8}
      style={
        {
          // border: `1px solid white`,
        }
      }
    >
      <Typography.Title level={3}>{props.name}</Typography.Title>
      <div
        style={{
          // border: "1px solid white",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          // alignItems: "stretch",
          // justifyContent: "str",

          // height: "50vh",
          borderRadius: 15,
        }}
      >
        {props?.members?.map((member, index) => (
          <BBMember
            index={index}
            getMembers={props.getMembers}
            // isEditable={props.isEditable}
            key={index}
            {...member}
            bb_team={{ ...props, members: [] }}
          />
        ))}
      </div>
    </Col>
  );
}
export default function Page() {
  const [members, setMembers] = useState<TypeBBUser[]>([]);
  const [membersSortable, setMembersSortable] = useState<TypeBBUser[]>([]);
  const [membersIsLoading, setMembersIsLoading] = useState<boolean>(false);
  // const [membersIsSorted, setMembersIsSorted] = useState<boolean>(false);
  const [teams, setTeams] = useState<TypeBBTeam[]>([]);
  const [teamsIsLoading, setTeamsIsLoading] = useState<boolean>(false);
  const [teamsIsEdited, setTeamsIsEdited] = useState<boolean>(false);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const router = useRouter();
  const { edit } = router.query;
  const data_members = useQuery("bb_users", () => POST_bb23_users_get({}), {
    keepPreviousData: false,
    refetchInterval: 10000,
  });
  const data_teams = useQuery("bb_teams", () => POST_bb23_teams_get(), {
    keepPreviousData: false,
    refetchInterval: 10000,
  });
  const members_get = () => {
    data_members.refetch();
  };
  const members_sort = async (args: {
    membersSortable: TypeBBUser[];
    teams: TypeBBTeam[];
    setTeams: Dispatch<SetStateAction<TypeBBTeam[]>>;
    sortAll?: boolean;
  }) => {
    try {
      // args.setTeams([]);
      // args.setTeams(JSON.parse(JSON.stringify(args.teams)) ?? []);
      setIsSorting(true);
      // const intervalTime = 1000;
      // const delay = async () => {
      //   await new Promise((resolve) => setTimeout(resolve, intervalTime));
      // };
      const _members: TypeBBUser[] = JSON.parse(
        JSON.stringify(args.membersSortable),
      );
      const teamCount = teams.length;
      const _teams: TypeBBTeam[] = JSON.parse(JSON.stringify(args.teams));
      if (!teamCount || !_teams || !_members) {
        throw new Error("no teams, or sortable members");
      }

      // PREPARE TEAMS
      // const _teams_members = {};
      _teams.map((team, index) => {
        if (!_teams[index].members) {
          _teams[index].members = [];
        } else {
        }
        if (args.sortAll === true) {
          // REMOVE THOSE ALREADY IN ARRAY
          _teams[index].members = [];
        }
      });
      _members.map((member, index) => {
        if (member.bb_team && args.sortAll !== true) {
          delete _members[index];
        }
        if (member.is_sortable !== true) {
          delete _members[index];
        }
      });
      // SHUFFLE ARRAY
      const _members_shuffled = _members
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value);
      // AND USER PER
      const rows = Math.ceil(_members_shuffled.length / _teams.length);
      let iteration = 0;
      let max = _members_shuffled.length;
      while (iteration <= max) {
        for (let row = 0; row < rows; row++) {
          loop_team: for (let i = 0; i < _teams.length; i++) {
            if (_members_shuffled[iteration] && _teams[i]) {
              const member = _teams[i]?.members[row];
              if (member) {
                // _teams[i + 1].members[row] = _members_shuffled[iteration];
                _teams[i + 1].members[row] = {
                  ..._members_shuffled[iteration],
                  bb_team: { ..._teams[i], members: [] },
                };
                args.setTeams((state) => _teams);
                i++;
                iteration++;
                // await delay();
                break loop_team;
              }
              _teams[i].members[row] = {
                ..._members_shuffled[iteration],
                bb_team: { ..._teams[i], members: [] },
              };
              // await delay();
              args.setTeams(_teams);
            }
            iteration++;
            if (iteration >= 100) return;
          }
        }
      }

      // fill
    } catch (e) {
      setIsSorting(false);
      console.error(e);
    } finally {
      setIsSorting(false);
      setTeamsIsEdited(true);
    }
  };
  const teams_get = () => {};
  const teams_save = (args: {
    teams: TypeBBTeam[];
    getMembers: () => void;
    setIsSaved: () => void;
  }) => {
    args.teams.map(async (team) => {
      // if (!team.members || team.members.length <= 0) return;
      const team_id = team.id;
      const members_id_array: number[] = [];
      team.members.map((member) => {
        members_id_array.push(member.id);
      });
      await toast
        .promise(
          POST_bb23_teams_set_members({
            team_id,
            members_id_array,
          }),
          {
            pending: `updating ${team.name}...`,
            // success: "Request Successful",
            // error: "Request failed",
          },
        )
        .then((res) => {
          if (res) {
            toast.success(`Successfully added member(s) to ${res.name}`);
            args.getMembers();
          }
        })
        .catch((e) => {
          toast.error(`Failed to update ${team.name}`);
          console.error(e);
        });
    });
    args.setIsSaved();
    args.getMembers();
  };
  useEffect(() => {
    const _data_members = data_members.data;
    const _data_teams = data_teams.data;
    // if (!teamsIsEdited) {
    if (true) {
      if (_data_members) {
        // let _members: TypeBBUser[] = [];
        let _members_sortable: TypeBBUser[] = [];
        let _members_sortable_not: TypeBBUser[] = [];
        _data_members.map((member) => {
          if (member.is_sortable) {
            _members_sortable.push(member);
          } else {
            _members_sortable_not.push(member);
          }
        });
        setMembers([..._members_sortable, ..._members_sortable_not]);
        setMembersSortable(_members_sortable);
      }
      if (_data_teams) {
        setTeams(_data_teams);
      }
    } else {
      toast.info("There is updated Data, but unsaved sort");
    }
  }, [data_members.data, data_teams.data, teamsIsEdited]);
  useEffect(() => {
    const _teamsIsLoading = data_teams.isLoading;
    const _membersIsLoading = data_members.isLoading;
    setTeamsIsLoading(_teamsIsLoading);
    setMembersIsLoading(_membersIsLoading);
  }, [data_members, data_teams]);
  // useEffect(() => {
  //   if (!members) return;
  //   let count = 0;
  //   members.map((member) => {
  //     if (member.is_sortable) count++;
  //   });
  //   setMembersSortable(count);
  // }, [members]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
      }}
    >
      <Typography.Title style={{ fontWeight: 800 }}>
        Welcome to BrownBag23
      </Typography.Title>
      <Row
        gutter={[24, 0]}
        style={{
          // display: "flex",
          // flexDirection: "column",
          width: "100%",
          height: "100%",
          maxWidth: "2000px",
          alignItems: "flex-start",
          // justifyContent: "flex-start",
          // gap: 10,
          //   border: "1px solid red",
        }}
      >
        <Col
          span={24}
          // xxl={12}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "fit-content",
            justifyContent: "space-between",
            textAlign: "center",
          }}
        >
          <Spin spinning={membersIsLoading}>
            <Typography.Title level={3} style={{ fontWeight: 700 }}>
              {`Members (${membersSortable.length}/${members.length})`}
            </Typography.Title>
            <div
              css={css({
                border: "1px solid white",
                width: "100%",
                maxWidth: "100%",
                height: "80vh",
                borderRadius: 15,
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
                flexWrap: "wrap",
                padding: 5,
                gap: 5,
                [DeviceScreen.mobile]: {
                  flexWrap: "unset",
                },
              })}
            >
              {members?.map((member, index) => (
                <BBMember
                  index={index}
                  isEditable={edit === "true" ? true : false}
                  getMembers={() => data_members.refetch()}
                  key={index}
                  {...member}
                />
              ))}
            </div>
            <div
              style={{
                width: "100%",
                height: "fit-content",
                paddingTop: 5,
                display: edit === "true" ? "flex" : "none",
                flexWrap: "wrap",
                gap: 5,
              }}
            >
              <Button
                type={"primary"}
                style={{ flex: 1 }}
                size="large"
                onClick={members_get}
              >
                Get Members
              </Button>
              <Button
                onClick={() => {
                  members_sort({
                    teams: data_teams.data ?? [],
                    membersSortable,
                    setTeams,
                  });
                }}
                type={"primary"}
                style={{ flex: 1 }}
                size="large"
                disabled={isSorting || membersSortable?.length <= 0}
              >
                {`Sort (unsorted)`}
              </Button>
              <Button
                onClick={() => {
                  members_sort({
                    teams: data_teams.data ?? [],
                    membersSortable,
                    setTeams,
                    sortAll: true,
                  });
                }}
                type={"primary"}
                style={{ flex: 1 }}
                size="large"
                disabled={isSorting || membersSortable?.length <= 0}
              >
                {`Sort (All)`}
              </Button>
            </div>
          </Spin>
        </Col>
        <Col
          span={24}
          // xxl={12}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "fit-content",
            justifyContent: "space-between",
            textAlign: "center",
          }}
        >
          <Spin spinning={teamsIsLoading}>
            <Typography.Title level={3} style={{ fontWeight: 700 }}>
              {teamsIsEdited ? `Teams (UN_SAVED)` : `Teams`}
            </Typography.Title>
            <Row
              gutter={[24, 0]}
              style={{
                display: "flex",
                // border: "1px solid white",
                width: "100%",
                height: "fit-content",
                minHeight: "80vh",
                borderRadius: 15,
                overflow: "auto",
              }}
            >
              {teams?.map((team, index) => (
                <BBTeam
                  isEditable={IS_EDITABLE}
                  getMembers={() => data_members.refetch()}
                  getTeams={() => data_teams.refetch()}
                  key={index}
                  {...team}
                />
              ))}
            </Row>
            <div
              style={{
                width: "100%",
                height: "fit-content",
                paddingTop: 5,
                display: edit === "true" ? "flex" : "none",
                gap: 5,
              }}
            >
              <Button
                type={"primary"}
                style={{ flex: 1 }}
                size="large"
                onClick={teams_get}
              >
                Get Members
              </Button>
              <Button
                onClick={() => {
                  teams_save({
                    teams,
                    getMembers: () => {
                      data_members.refetch();
                    },
                    setIsSaved: () => {
                      setTeamsIsEdited(false);
                      data_teams.refetch();
                    },
                  });
                }}
                type={"primary"}
                style={{ flex: 1 }}
                size="large"
                disabled={!teamsIsEdited}
              >
                Save
              </Button>
            </div>
          </Spin>
        </Col>
        {/* <Row gutter={[24, 0]} style={{ display: "flex", flex: 1 }}></Row> */}
      </Row>
    </div>
  );
}
