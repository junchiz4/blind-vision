import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import { View, Text, StyleProp, TextStyle } from 'react-native'
import { RelativePathString, useRouter } from 'expo-router'
import { Icon, List, Switch } from 'react-native-paper'

import CustomStatusBanner from '../home/CustomStatusBanner'

import LayoutObject from '@/constants/types/LayoutObject'
import icons from '@/constants/icons'

import { GlassesConnectionContext, StickConnectionContext } from '@/app/(tabs)/_layout'
import { AuthContext, ThemeContext } from '@/app/_layout'

interface CustomListProps {
  title: string,
  layout: LayoutObject[]
}

const myColorByTheme = (dark: boolean, text: boolean = true) => {
  if (text) {return dark ? "white" : "black"}
  else { return dark ? "#222222" : "white"}
}

const myTitleStyle: (dark: boolean) => StyleProp<TextStyle> = (dark) => { 
  return { 
    color: myColorByTheme(dark), 
    fontSize: 20, 
    fontWeight: 500 
  }
}

const chooseRightIcon: (
  title: string,
  destination: string | undefined, 
  status: boolean | undefined,
  dark: boolean,
  setDark: Dispatch<SetStateAction<boolean>>,
  connected: boolean
) => [string, string, React.JSX.Element] = 
(title, destination, status, dark, setDark, connected) => {
  if (destination !== undefined) {
    let accessibilityHint = `Double tap to navigate to ${title} page`
    if (title.toLowerCase() === "log out" || title.toLowerCase() === "delete account") { 
      accessibilityHint = `Double tap to ${title}`
    }

    return [
      accessibilityHint,
      `${title} button`, 
      <RightArrow/>
    ]
  } else if (status !== undefined) {
    return [
      ``,
      `${title} ${connected ? "connected" : "disconnected"}`,
      <CustomStatusBanner connected={connected}/>
    ]
  } else { 
    return [
      `Double tap to toggle dark mode`,
      `${title} switch`, 
      <Switch value={dark} onValueChange={setDark} color="lightgreen"/>
    ]}
}

const RightArrow = () => {
  return (
    <View className='my-auto'>
      <Icon source={icons.rightArrow} size={20}/>
    </View>
  )
}

const ListItem: React.FC<{ 
  title: string,
  obj: LayoutObject, 
  dark: boolean,
  setDark: Dispatch<SetStateAction<boolean>>
}> = ({ title, obj, dark, setDark }) => {
  const router = useRouter()
  const [_, setAuth] = useContext(AuthContext)
  const [isGlassesConnected, _1] = useContext(GlassesConnectionContext)
  const [isStickConnected, _2] = useContext(StickConnectionContext)
  const connected = (title === "Glasses") ? isGlassesConnected : isStickConnected   
  const [myAccessibilityHint, 
         myAccessibilityLabel,
         rightComponent] = chooseRightIcon(obj.title, 
                                           obj.destination, 
                                           obj.status, 
                                           dark, 
                                           setDark,
                                           connected)

  return (
    <List.Item 
      title={obj.title}
      titleStyle={myTitleStyle(dark)}
      left={() => (
        <View className='my-auto'>
          <Icon source={obj.imageSource} size={25} color={myColorByTheme(dark)}/>
        </View>
      )}
      right={() => rightComponent}
      style={{ borderBottomWidth: 1, borderBottomColor: "#BFBFBF", paddingLeft: 20, paddingVertical: 15 }}
      onPress={() => { 
        if ( obj.destination !== undefined ) { 
          if ( obj.replace !== undefined ) { setAuth(null); router.navigate("/(auth)/sign-in"); } 
          else { router.push(obj.destination as RelativePathString) }
        } else if ( obj.status === undefined ) { setDark(!dark) }
      }}

      focusable={false}
      accessibilityLabel={myAccessibilityLabel}
      accessibilityHint={myAccessibilityHint}
    />
  )
}

const ListAccordion: React.FC<{ obj: LayoutObject, dark: boolean }> = ({ obj, dark }) => {
  const [choice, setChoice] = useState(0)
  const [isExpanded, setExpansion] = useState(false)

  return (
    <List.Accordion
      title={obj.title}
      titleStyle={myTitleStyle(dark)}
      left={props => <List.Icon {...props} icon={obj.imageSource} color={myColorByTheme(dark)}/>}
      right={() => (
        <View className='flex flex-row items-center'>
          <Text className={`mr-1 ${dark ? "text-white" : "text-gray-300"}`}>{obj.dropdown[choice]}</Text>
          <Icon
            source={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
          />
        </View>
      )}
      style={{ backgroundColor: myColorByTheme(dark, false) }}
      expanded={isExpanded}
      onPress={() => setExpansion(!isExpanded)}

      accessibilityLabel={`${obj.title} dropdown, ${obj.dropdown[choice]} selected`}
      >
      {obj.dropdown.map((item, index) => 
        <List.Item 
        accessibilityLabel={`${item} ${(choice === index) ? "selected" : ""}`}
        
        key={index} 
        title={item} 
        titleStyle={{ color: myColorByTheme(dark) }}
        right={() => <>{(choice === index) && <Icon source="check" color={myColorByTheme(dark)} size={20}/>}</>}
        style={{ width: "80%", marginHorizontal: "auto" }}
        onPress={() => setChoice(index)}
        />
      )}
    </List.Accordion>
  )
}

const CustomList: React.FC<CustomListProps> = ({ title, layout }) => {
  const [dark, setDark] = useContext(ThemeContext)

  return (
    <List.Section>
      {layout.map((obj, index) => {
        if (obj.dropdown !== undefined) { return <ListAccordion key={index} obj={obj} dark={dark}/> } 
        else { return <ListItem key={index} title={title} obj={obj} dark={dark} setDark={setDark}/>}
      })}
    </List.Section>
  )
}

export default CustomList